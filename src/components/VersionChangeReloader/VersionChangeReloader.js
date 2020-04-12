import { useEffect } from 'react';
import { useDatabase, useDatabaseObjectData } from 'reactfire';

export default function VersionChangeReloader() {
  const database = useDatabase();
  const versionInfo = useDatabaseObjectData(database.ref('versionInfo'));
  const sessionVersion = window.sessionStorage.getItem('CV19AssistVersion');

  function setVersionToStorage(refreshVersion) {
    window.sessionStorage.setItem('CV19AssistVersion', refreshVersion);
  }
  function refreshPage() {
    window.location.reload(true);
  }

  useEffect(() => {
    const currentRemoteVersion = versionInfo.current;
    const currentClientVersion = window.version;

    // set version to session storage if it does not exist
    if (!sessionVersion) {
      setVersionToStorage(currentRemoteVersion);
      // Exit since the client does not have a version in session storage
      return;
    }

    // Exit if there is no current remote version
    if (!currentRemoteVersion) {
      return;
    }

    // Check if version in Database matches client's session version
    const versionDiscrepencyExists =
      currentRemoteVersion !== currentClientVersion;

    // Previous refresh or version set to state has happened
    const refreshHasOccurred = currentRemoteVersion === sessionVersion;

    // Refresh if session contains different version than database
    if (versionDiscrepencyExists && !refreshHasOccurred) {
      refreshPage(currentRemoteVersion);
    }
  }, [versionInfo, sessionVersion]);

  // render nothing
  return null;
}
