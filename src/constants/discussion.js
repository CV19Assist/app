import React from 'react';
import {
  Done as CompletionIcon,
  ExitToApp as ReleaseIcon,
  PanTool as AcceptanceIcon,
  SupervisorAccount as AdminIcon,
} from '@material-ui/icons';

const kindMap = {
  1: {
    shortDescription: 'Discussion',
  },
  5: {
    shortDescription: 'Release comment',
    icon: <ReleaseIcon />,
  },
  8: {
    shortDescription: 'Admin comment',
    icon: <AdminIcon />,
  },
  10: {
    shortDescription: 'Acceptance comment',
    icon: <AcceptanceIcon />,
  },
  15: {
    shortDescription: 'Assignment comment',
  },
  20: {
    shortDescription: 'Completion comment',
    icon: <CompletionIcon />,
  },
};

export default kindMap;
