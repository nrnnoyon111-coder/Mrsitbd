import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Briefcase,
  ExternalLink,
  Edit,
  X,
  Check,
} from 'lucide-react';
import { Client } from '../../types';
import { CopyButton } from '../CopyButton';
import { useToast } from '../Toast';

interface ClientListProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onViewClientJobs: (clientName: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  onAddClient,
  onUpdateClient,
  onViewClientJobs,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [company, setCompany] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredClients = clients.filter((c) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      c.company.toLowerCase().includes(s) ||
      c.customerName.toLowerCase().includes(s) ||
      c.phone.toLowerCase().includes(s) ||
      c.clientCode.toLowerCase().includes(s)
    );
  });

  const handleOpenAdd = () => {
    setCompany('');
    setCustomerName('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setAddress('');
    setNotes('');
    setEditingClient(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setCompany(client.company);
    setCustomerName(client.customerName);
    setPhone(client.phone);
    setWhatsapp(client.whatsapp);
    setEmail(client.email);
    setAddress(client.address);
    setNotes(client.notes || '');
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() && !customerName.trim()) {
      showToast('Company or Contact Person name is required.', 'error');
      return;
    }

    try {
      if (editingClient) {
        const res = await fetch(`/api/clients/${editingClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company,
            customerName,
            phone,
            whatsapp,
            email,
            address,
            notes,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          onUpdateClient(data.client);
          showToast(`Client ${data.client.company} updated!`, 'success');
          setShowAddModal(false);
        }
      } else {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company,
            customerName,
            phone,
            whatsapp: whatsapp || phone,
            email,
            address,
            notes,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          onAddClient(data.client);
          showToast(`Client ${data.client.company} added!`, 'success');
          setShowAddModal(false);
        }
      }
    } catch (err) {
      showToast('Error saving client', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Client & Factory Directory
          </h2>
          <p className="text-xs text-slate-500">
            Total {clients.length} registered apparel manufacturing & electronics clients
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Client, Factory, Phone..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Client</span>
          </button>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                  {client.clientCode}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                  {client.company}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Contact: <strong className="text-slate-800">{client.customerName}</strong>
                </p>
              </div>

              <button
                onClick={() => handleOpenEdit(client)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                title="Edit Client"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Contacts & Address */}
            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 font-mono">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  Phone:
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  {client.phone}
                  <CopyButton text={client.phone} />
                </span>
              </div>

              {client.email && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    Email:
                  </span>
                  <span className="text-slate-700 truncate max-w-[150px]">
                    {client.email}
                  </span>
                </div>
              )}

              <div className="flex items-start gap-1.5 pt-1 text-[11px] text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{client.address}</span>
              </div>
            </div>

            {/* Stats row: Total Jobs, Total Spent */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Jobs</span>
                <strong className="font-mono text-slate-800">{client.totalJobs} Orders</strong>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Total Revenue</span>
                <strong className="font-mono text-emerald-600">৳{client.totalSpent.toLocaleString()}</strong>
              </div>
            </div>

            {/* Quick Action Buttons (Call, WhatsApp, Email, View Jobs) */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <a
                href={`tel:${client.phone}`}
                title="Call Client"
                className="py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>

              <a
                href={`https://wa.me/${(client.whatsapp || client.phone).replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Send WhatsApp"
                className="py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                <span>WA</span>
              </a>

              {client.email ? (
                <a
                  href={`mailto:${client.email}`}
                  title="Send Email"
                  className="py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  <span>Mail</span>
                </a>
              ) : (
                <div className="py-1.5 rounded-lg bg-slate-50 text-slate-300 text-xs flex items-center justify-center">
                  -
                </div>
              )}

              <button
                onClick={() => onViewClientJobs(client.company || client.customerName)}
                title="View Repair History"
                className="py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Briefcase className="w-3 h-3" />
                <span>Jobs</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingClient ? 'Edit Client Record' : 'Register New Client'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Company / Garments Name *</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Ha-Meem Textile & Garments Ltd."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Person Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Engr. Mahfuzul Alam"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+8801711223344"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+8801711223344"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maintenance@factory.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Factory / Workshop Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Ashulia Industrial Area, Savar, Dhaka"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingClient ? 'Save Changes' : 'Create Client'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
