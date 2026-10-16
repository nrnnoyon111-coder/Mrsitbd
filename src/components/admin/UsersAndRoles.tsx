import React, { useState } from 'react';
import {
  Shield,
  User,
  Key,
  Check,
  AlertCircle,
  Plus,
  Edit,
  X,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  Camera,
  Phone,
  Mail,
  Lock,
  UserCheck,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';
import { User as UserType } from '../../types';
import { useToast } from '../Toast';

interface UsersAndRolesProps {
  users: UserType[];
  onAddUser?: (user: UserType) => void;
  onUpdateUser?: (user: UserType) => void;
  onDeleteUser?: (userId: string) => void;
}

export const UsersAndRoles: React.FC<UsersAndRolesProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const { showToast } = useToast();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(users[0] || null);

  // Add Admin Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields for New Admin
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'Super Admin' | 'Administrator' | 'Technician' | 'Sales Manager' | 'Website Manager'>('Administrator');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [customUrlMode, setCustomUrlMode] = useState(false);

  // Edit Admin Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editUserId, setEditUserId] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editShowPassword, setEditShowPassword] = useState(false);
  const [editRole, setEditRole] = useState<'Super Admin' | 'Administrator' | 'Technician' | 'Sales Manager' | 'Website Manager'>('Administrator');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [editCustomUrlMode, setEditCustomUrlMode] = useState(false);

  const permissionLabels: Record<string, string> = {
    dashboard: 'View Executive Dashboard & Analytics',
    addJob: 'Create New Repair Jobs (M000X generator)',
    editJob: 'Edit Job Details & Diagnostic Notes',
    changeStatus: 'Update Repair Status (Completed, Picked Up)',
    jobList: 'Access Full Job Records & Filters',
    clients: 'Manage Client & Factory Directory',
    boardPresets: 'Manage Board Brands & Preset Dictionary',
    collections: 'Record Billing & Payment Collections',
    ledger: 'Access Financial Ledger & Balances',
    sales: 'Access Parts Sales & Counter POS',
    inventory: 'Manage Spare Parts & Stock Levels',
    expenses: 'Record Workshop Expenses & Vouchers',
    reports: 'Export Audit Reports & CSVs',
    homepage: 'Edit Homepage CMS & Contact Info',
    users: 'Manage Admin Users & Roles',
    sync: 'Execute Google Sheet Sync & Backfill',
    settings: 'Configure System Localization Settings',
    archive: 'Access & Restore Archived Records',
  };

  const getRoleDefaultPermissions = (r: string) => {
    const isSuper = r === 'Super Admin' || r === 'Administrator';
    return {
      dashboard: true,
      addJob: r === 'Technician' || isSuper,
      editJob: r === 'Technician' || isSuper,
      changeStatus: r === 'Technician' || isSuper,
      jobList: true,
      clients: r === 'Sales Manager' || isSuper,
      boardPresets: r === 'Technician' || isSuper,
      collections: r === 'Sales Manager' || isSuper,
      ledger: r === 'Sales Manager' || isSuper,
      sales: r === 'Sales Manager' || isSuper,
      inventory: r === 'Technician' || r === 'Sales Manager' || isSuper,
      expenses: r === 'Sales Manager' || isSuper,
      reports: r === 'Sales Manager' || r === 'Website Manager' || isSuper,
      homepage: r === 'Website Manager' || isSuper,
      users: isSuper,
      sync: isSuper,
      settings: isSuper,
      archive: isSuper,
    };
  };

  const handleOpenAddModal = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRole('Administrator');
    setAvatarUrl('');
    setPhotoPreview(null);
    setCustomUrlMode(false);
    setShowPassword(false);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (u: UserType) => {
    setEditUserId(u.id);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPhone(u.phone || '');
    setEditPassword('');
    const validRole = (['Super Admin', 'Administrator', 'Technician', 'Sales Manager', 'Website Manager'].includes(u.role)
      ? u.role
      : 'Administrator') as any;
    setEditRole(validRole);
    setEditAvatarUrl(u.avatarUrl || '');
    setEditPhotoPreview(u.avatarUrl || null);
    setEditCustomUrlMode(false);
    setEditShowPassword(false);
    setShowEditModal(true);
  };

  // Photo file upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isEdit) {
          setEditPhotoPreview(base64);
          setEditAvatarUrl(base64);
        } else {
          setPhotoPreview(base64);
          setAvatarUrl(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Avatar presets
  const avatarPresets = [
    '/src/assets/images/regenerated_image_1791974773522.jpg',
    '/src/assets/images/avatar_proprietor_1791971385592.jpg',
  ];

  // Create New Admin Submit
  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter full name.', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Please provide a valid Gmail/Email address.', 'error');
      return;
    }
    if (!password.trim() || password.length < 4) {
      showToast('Password must be at least 4 characters.', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        avatarUrl: avatarUrl || photoPreview || '',
        password: password.trim(),
        role,
        permissions: getRoleDefaultPermissions(role),
      };

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create admin account.');
      }

      showToast(`Admin account for ${data.user.name} created successfully with role: ${data.user.role}!`, 'success');
      if (onAddUser) onAddUser(data.user);
      setSelectedUser(data.user);
      setShowAddModal(false);
    } catch (err: any) {
      showToast(err.message || 'Error creating admin', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Edit Admin Submit
  const handleEditAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editName.trim()) {
      showToast('Please enter full name.', 'error');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      showToast('Please provide a valid Gmail/Email address.', 'error');
      return;
    }

    setEditLoading(true);

    try {
      const payload: any = {
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        phone: editPhone.trim(),
        avatarUrl: editAvatarUrl || editPhotoPreview || '',
        role: editRole,
        permissions: getRoleDefaultPermissions(editRole),
      };

      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      const res = await fetch(`/api/users/${editUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update admin account.');
      }

      showToast(`Admin details updated for ${data.user.name}!`, 'success');
      if (onUpdateUser) onUpdateUser(data.user);
      if (selectedUser?.id === data.user.id) {
        setSelectedUser(data.user);
      }
      setShowEditModal(false);
    } catch (err: any) {
      showToast(err.message || 'Error updating admin', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleTogglePermission = (key: string) => {
    if (!selectedUser) return;
    const current = selectedUser.role === 'Super Admin' || Boolean((selectedUser.permissions as any)[key]);
    const updated = {
      ...selectedUser.permissions,
      [key]: !current,
    };
    setSelectedUser({
      ...selectedUser,
      permissions: updated as any,
    });
  };

  const handleSaveUserPermissions = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedUser.role,
          permissions: selectedUser.permissions,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Permissions updated for ${selectedUser.name}!`, 'success');
        if (onUpdateUser) onUpdateUser(data.user);
      }
    } catch (err) {
      showToast('Failed to save permissions', 'error');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === 'user-1' || users.findIndex(u => u.id === userId) === 0 || selectedUser?.email === 'nrnnoyon111@gmail.com') {
      showToast('Cannot delete the primary Super Administrator account.', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to remove the admin account for "${userName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(`Admin ${userName} removed.`, 'info');
        if (onDeleteUser) onDeleteUser(userId);
        setSelectedUser(users[0] || null);
      } else {
        showToast(data.error || 'Failed to delete user', 'error');
      }
    } catch (err) {
      showToast('Error removing user', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Admin Accounts & Defined Role Assignment
            </h2>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
              RBAC
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and manage staff accounts with Gmail, full name, photo, phone, password and defined role privileges
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Admin</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Staff Accounts List (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Registered Staff Users ({users.length})
            </h3>
            <button
              onClick={handleOpenAddModal}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              + Add Admin
            </button>
          </div>

          <div className="space-y-3">
            {users.map((u, idx) => {
              const isSelected = selectedUser?.id === u.id;
              const isPrimary = idx === 0 || u.id === 'user-1' || u.email === 'nrnnoyon111@gmail.com';

              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/30'
                      : 'border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs overflow-hidden shrink-0 border border-slate-200 shadow-xs relative">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-sm uppercase font-extrabold">{u.name.charAt(0)}</span>
                      )}
                      {isPrimary && (
                        <span className="absolute bottom-0 inset-x-0 bg-blue-600 text-[8px] text-white text-center font-bold uppercase leading-tight py-0.5">
                          Super
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs truncate">{u.name}</span>
                        {isPrimary && (
                          <span title="Primary Super Administrator">
                            <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                      <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md mt-1">
                        {u.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(u);
                      }}
                      title="Edit Admin Details"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {!isPrimary && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(u.id, u.name);
                        }}
                        title="Remove Admin"
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Profile & Permissions Matrix for Selected User (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          {selectedUser ? (
            <div>
              {/* Selected User Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm overflow-hidden border border-slate-200 shadow-sm shrink-0">
                    {selectedUser.avatarUrl ? (
                      <img
                        src={selectedUser.avatarUrl}
                        alt={selectedUser.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      selectedUser.name.charAt(0)
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {selectedUser.name}
                      </h3>
                      {selectedUser.email === 'nrnnoyon111@gmail.com' && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          Primary Super Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      Gmail: <strong className="text-slate-800">{selectedUser.email}</strong>
                    </p>
                    <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      Phone: <strong className="text-slate-800">{selectedUser.phone || 'Not specified'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">DEFINED ROLE</span>
                    <span className="text-xs font-bold text-blue-700 font-mono bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 inline-block mt-0.5">
                      {selectedUser.role}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(selectedUser)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1 ml-1"
                    title="Edit profile photo, phone, Gmail, password and role"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveUserPermissions}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Role Privileges Overview */}
              <div className="pt-3 pb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase font-mono">
                  Module Permissions & Access Rights
                </span>
                <span className="text-[11px] text-slate-400">
                  Click any permission to toggle override
                </span>
              </div>

              {/* Permissions Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {Object.entries(permissionLabels).map(([key, label]) => {
                  const hasPermission =
                    selectedUser.role === 'Super Admin' ||
                    Boolean((selectedUser.permissions as any)[key]);
                  const isSuperAdminAccount = selectedUser.role === 'Super Admin';

                  return (
                    <div
                      key={key}
                      onClick={() => !isSuperAdminAccount && handleTogglePermission(key)}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                        isSuperAdminAccount ? 'cursor-default' : 'cursor-pointer hover:border-blue-300'
                      } ${
                        hasPermission
                          ? 'border-emerald-200/70 bg-emerald-50/40 text-emerald-900'
                          : 'border-slate-100 bg-slate-50 text-slate-500'
                      }`}
                    >
                      <span className="font-medium pr-2">{label}</span>
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          hasPermission
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {hasPermission ? 'Granted' : 'Denied'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select an admin user from the left to view profile and configure permissions.
            </div>
          )}
        </div>

      </div>

      {/* --- ADD NEW ADMIN MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">
                    Add New Admin Account
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Input Gmail, name, photo, phone, password and assign defined role
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAdminSubmit} className="p-6 sm:p-7 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              
              {/* Photo Upload & Preview Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {photoPreview || avatarUrl ? (
                    <img
                      src={photoPreview || avatarUrl}
                      alt="Admin preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <Camera className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-[9px] block">No Photo</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800">
                      Admin Profile Photo
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomUrlMode(!customUrlMode)}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>{customUrlMode ? 'Use File Upload' : 'Paste Image URL'}</span>
                    </button>
                  </div>

                  {customUrlMode ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => {
                          setAvatarUrl(e.target.value);
                          setPhotoPreview(e.target.value);
                        }}
                        placeholder="https://example.com/photo.jpg"
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-mono"
                      />
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarUrl('');
                            setPhotoPreview(null);
                          }}
                          className="px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold cursor-pointer shadow-xs">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Choose Photo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, false)}
                          className="hidden"
                        />
                      </label>

                      {avatarPresets.map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setAvatarUrl(preset);
                            setPhotoPreview(preset);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-blue-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
                        >
                          Preset {i + 1}
                        </button>
                      ))}

                      {(photoPreview || avatarUrl) && (
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarUrl('');
                            setPhotoPreview(null);
                          }}
                          className="px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500">
                    Supports JPG, PNG, WEBP from your local computer or device
                  </p>
                </div>
              </div>

              {/* Name & Gmail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Md. Tariqul Islam"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-800">
                      Gmail Address *
                    </label>
                    {!email.includes('@') && email.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setEmail(`${email}@gmail.com`)}
                        className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        + @gmail.com
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. tariqul.mrs@gmail.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Phone & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +8801712345678"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 4 characters"
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Defined Role Assignment */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-900">
                    Assign Defined Role *
                  </label>
                  <span className="text-[11px] text-blue-600 font-bold font-mono">
                    Selected: {role}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'Super Admin', label: 'Super Admin', desc: 'Full root control over all 17 modules, staff management & security' },
                    { id: 'Administrator', label: 'Administrator', desc: 'Complete operational management (repairs, sales, inventory, accounting)' },
                    { id: 'Technician', label: 'Technician', desc: 'Circuit board diagnostics, repair intake, board status & spare parts' },
                    { id: 'Sales Manager', label: 'Sales Manager', desc: 'Parts POS sales, client directory, billing collections, ledger & stock' },
                    { id: 'Website Manager', label: 'Website Manager', desc: 'Homepage CMS content, announcement notices, company contacts' },
                  ].map((rItem) => (
                    <label
                      key={rItem.id}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        role === rItem.id
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="adminRole"
                        value={rItem.id}
                        checked={role === rItem.id}
                        onChange={() => setRole(rItem.id as any)}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{rItem.label}</span>
                          {role === rItem.id && <Sparkles className="w-3 h-3 text-blue-600" />}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{rItem.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Create & Assign {role}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- EDIT ADMIN MODAL --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-sm">
                  <Edit className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">
                    Edit Admin Account & Role
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Update Gmail, name, photo, phone, password and defined role
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditAdminSubmit} className="p-6 sm:p-7 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              
              {/* Photo Upload & Preview Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {editPhotoPreview || editAvatarUrl ? (
                    <img
                      src={editPhotoPreview || editAvatarUrl}
                      alt="Admin preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <Camera className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-[9px] block">No Photo</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800">
                      Update Profile Photo
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditCustomUrlMode(!editCustomUrlMode)}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>{editCustomUrlMode ? 'Use File Upload' : 'Paste Image URL'}</span>
                    </button>
                  </div>

                  {editCustomUrlMode ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={editAvatarUrl}
                        onChange={(e) => {
                          setEditAvatarUrl(e.target.value);
                          setEditPhotoPreview(e.target.value);
                        }}
                        placeholder="https://example.com/photo.jpg"
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-mono"
                      />
                      {editAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditAvatarUrl('');
                            setEditPhotoPreview(null);
                          }}
                          className="px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold cursor-pointer shadow-xs">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Choose New Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, true)}
                          className="hidden"
                        />
                      </label>

                      {avatarPresets.map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setEditAvatarUrl(preset);
                            setEditPhotoPreview(preset);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-blue-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
                        >
                          Preset {i + 1}
                        </button>
                      ))}

                      {(editPhotoPreview || editAvatarUrl) && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditAvatarUrl('');
                            setEditPhotoPreview(null);
                          }}
                          className="px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Name & Gmail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Gmail Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Phone & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g. +8801712345678"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Password (leave empty to keep current)
                  </label>
                  <div className="relative">
                    <input
                      type={editShowPassword ? 'text' : 'password'}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Enter new password if changing"
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setEditShowPassword(!editShowPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      {editShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Defined Role Assignment */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-900">
                    Assign Defined Role *
                  </label>
                  <span className="text-[11px] text-blue-600 font-bold font-mono">
                    Selected: {editRole}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'Super Admin', label: 'Super Admin', desc: 'Full root control over all 17 modules, staff management & security' },
                    { id: 'Administrator', label: 'Administrator', desc: 'Complete operational management (repairs, sales, inventory, accounting)' },
                    { id: 'Technician', label: 'Technician', desc: 'Circuit board diagnostics, repair intake, board status & spare parts' },
                    { id: 'Sales Manager', label: 'Sales Manager', desc: 'Parts POS sales, client directory, billing collections, ledger & stock' },
                    { id: 'Website Manager', label: 'Website Manager', desc: 'Homepage CMS content, announcement notices, company contacts' },
                  ].map((rItem) => (
                    <label
                      key={rItem.id}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        editRole === rItem.id
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="editAdminRole"
                        value={rItem.id}
                        checked={editRole === rItem.id}
                        onChange={() => setEditRole(rItem.id as any)}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{rItem.label}</span>
                          {editRole === rItem.id && <Sparkles className="w-3 h-3 text-blue-600" />}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{rItem.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  {editLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes & Assign {editRole}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
