import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './styles.css';

/**
 * EmailSystem Component
 * Feature: email_system
 * Refactored for better performance and maintainability
 */
const EmailSystem = ({ initialState = null, onAction = null }) => {
  const [state, setState] = useState(initialState);

  const handleClick = useCallback(() => {
    setState('active');
    onAction?.('clicked');
  }, [onAction]);

  return (
    <div
      data-testid="email_system-container"
      className="email_system-component"
      aria-label="Email System"
    >
      <h2>Email System</h2>
      <button
        onClick={handleClick}
        role="button"
        aria-pressed={state === 'active'}
      >
        Action
      </button>
    </div>
  );
};

EmailSystem.propTypes = {
  initialState: PropTypes.string,
  onAction: PropTypes.func,
};

export default React.memo(EmailSystem);
