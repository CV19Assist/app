const functions = require("firebase-functions");
const { db, admin } = require("../util/admin");

const config = functions.config();
const adminEmails = config.admin.emails;

async function generateNotificationEmail(need) {
  // Generate an email
  await db.collection('mail').add({
    to: adminEmails,
    template: {
      name: "need-new",
      data: { config: config, need: need }
    }
  });
}

// Creates the summary info which will be saved in the unfulfilled info aggregate.
function createNeedSummary(id, need) {
  return needSummary = {
    id: id,
    createdAt: need.d.createdAt,
    firstName: need.d.firstName,
    needs: need.d.needs,
    immediacy: need.d.immediacy,
    // TODO: Add coordinates
  };
}
exports.createNeedSummary = createNeedSummary;

function addToAggregateInfo(needSummary) {
  let unfulfilledNeedsInfo = db.collection("aggregates").doc("unfulfilledNeedsInfo");
  return unfulfilledNeedsInfo.set({
    count: admin.firestore.FieldValue.increment(1),
    needs: admin.firestore.FieldValue.arrayUnion(needSummary)
  }, {merge: true});
}

function removeFromAggregateInfo(needSummary) {
  let unfulfilledNeedsInfo = db.collection("aggregates").doc("unfulfilledNeedsInfo");
  return unfulfilledNeedsInfo.set({
    count: admin.firestore.FieldValue.increment(-1),
    needs: admin.firestore.FieldValue.arrayRemove(needSummary)
  }, {merge: true});
}

exports.onNewNeedCreated = functions.firestore
  .document('needs/{needId}').onCreate(async (needSnapshot, context) => {
    const need = {id: needSnapshot.id, ...needSnapshot.data()}
    await generateNotificationEmail(need);

    // Update the unfulfilled needs info.
    let needSummary = createNeedSummary(needSnapshot.id, need);
    // console.log(needSummary);
    return addToAggregateInfo(needSummary);
  });


exports.onNeedDeleted = functions.firestore
  .document('needs/{needId}').onDelete((needSnapshot) => {
    let needSummary = createNeedSummary(needSnapshot.id, needSnapshot.data());
    return removeFromAggregateInfo(needSummary);
  });


exports.onNeedUpdated = functions.firestore
  .document('needs/{needId}').onUpdate((change) => {
    // Update the count based on the status.
    let needBefore = change.before.data();
    let needAfter = change.after.data();

    // If the status has changed.
    if (needBefore.d.status !== needAfter.d.status) {
      let needSummary = createNeedSummary(change.after.id, needAfter);
      if (needAfter.d.status === 1) {    // 1-new-or-released
        addToAggregateInfo(needSummary);
      } else if ((needAfter.d.status === 20) || (needAfter.d.status === 10)) { // Completed or assigned.
        removeFromAggregateInfo(needSummary);
      }
    }
  });
