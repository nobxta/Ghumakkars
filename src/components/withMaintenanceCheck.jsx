import React from 'react';
import useMaintenanceCheck from '../hooks/useMaintenanceCheck';
import MaintenancePopup from './MaintenancePopup';

// Higher-order component to handle maintenance mode checks
const withMaintenanceCheck = (WrappedComponent) => {
  return function MaintenanceCheckWrapper(props) {
    const { isMaintenanceMode, maintenanceData, handleMaintenanceAction } = useMaintenanceCheck();
    const [showMaintenancePopup, setShowMaintenancePopup] = React.useState(false);

    const checkMaintenanceBeforeAction = (actionCallback) => {
      const result = handleMaintenanceAction(actionCallback);
      
      if (result.blocked) {
        setShowMaintenancePopup(true);
        return false;
      }
      
      return true;
    };

    const handleAction = (actionCallback) => {
      if (checkMaintenanceBeforeAction(actionCallback)) {
        actionCallback();
      }
    };

    return (
      <>
        <WrappedComponent 
          {...props} 
          isMaintenanceMode={isMaintenanceMode}
          checkMaintenanceBeforeAction={checkMaintenanceBeforeAction}
          handleAction={handleAction}
        />
        <MaintenancePopup
          isOpen={showMaintenancePopup}
          onClose={() => setShowMaintenancePopup(false)}
          maintenanceData={maintenanceData}
        />
      </>
    );
  };
};

export default withMaintenanceCheck;
