const functions = require("firebase-functions");
const { db, admin } = require("../util/admin");
const { createNeedSummary } = require("../triggers/needs");

const config = functions.config();

// Resets the aggregate info.  This can be expensive depending on the doc count.
async function resetAggregateInfo() {
  let info = { count: 0, needs: [] };

  const qsnap = await db.collection("needs")
    .where("d.status", "==", 1)
    .limit(10).get();

  let count = 0;
  const needs = qsnap.docs.map(docSnapshot => {
    count++;
    return createNeedSummary(docSnapshot.id, docSnapshot.data());
  });
  info.count = count;
  info.needs = needs;
  // console.log(info);
  let unfulfilledNeedsInfo = db.collection("aggregates").doc("unfulfilledNeedsInfo");
  return unfulfilledNeedsInfo.set(info);
}

resetAggregateInfo()
  .catch(err => {
    console.log(err);
  });