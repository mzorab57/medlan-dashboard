import { useAuth } from '../store/auth';

export default function RequireRole({ roles, children }) {
  const { user } = useAuth();
  const allowed = Array.isArray(roles) ? roles.includes(user?.role) : true;
  if (!allowed) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-6">
          <div className="text-lg font-semibold mb-2">Access Denied</div>
          <div className="text-sm text-gray-600">You don't have permission to view this page.</div>
        </div>
      </div>
    );
  }
  return children;
}
