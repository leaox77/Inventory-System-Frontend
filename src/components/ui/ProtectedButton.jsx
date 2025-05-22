import { IconButton, Tooltip } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedButton = ({
  permission,
  tooltip,
  onClick,
  icon,
  color = 'primary',
  size = 'small',
  disabled = false
}) => {
  const { currentUser } = useAuth();

  const hasPermission = () => {
    if (!currentUser) return false;
    if (currentUser.role_id === 1) return true; // Admin tiene acceso a todo
    return currentUser.permissions?.[permission] === true;
  };

  if (!hasPermission()) return null;

  return (
    <Tooltip title={tooltip}>
      <IconButton
        size={size}
        color={color}
        onClick={onClick}
        disabled={disabled}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export default ProtectedButton;