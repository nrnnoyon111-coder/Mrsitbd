import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Plus,
  UserPlus,
  Check,
  Sparkles,
  AlertCircle,
  Wrench,
  Shield,
  CheckCircle2,
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  Building2,
} from 'lucide-react';
import { Client, PresetData, RepairJob } from '../../types';
import { useToast } from '../Toast';

interface AddJobModalProps {
  clients: Client[];
  presets: PresetData;
  onClose: () => void;
  onJobCreated: (job: RepairJob) => void;
  onClientCreated: (client: Client) => void;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({
  clients,
  presets,
  onClose,
  onJobCreated,
  onClientCreated,
}) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [nextJobNumber, setNextJobNumber] = useState('M0007');
  const [showAddClientForm, setShowAddClientForm] = useState(false);

  // Searchable Client Dropdown State
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  // Form State
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [company, setCompany] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [brand, setBrand] = useState('Hashima');
  const [model, setModel] = useState('HP-450 MS');
  const [boardType, setBoardType] = useState('Main Board');
  const [boardNumber, setBoardNumber] = useState('');
  const [boardSerial, setBoardSerial] = useState('');
  const [problem, setProblem] = useState('');
  const [remarks, setRemarks] = useState('');
  const [challan, setChallan] = useState('');
  const [technician, setTechnician] = useState('MD. RAKIBUL ISLAM');
  const [status, setStatus] = useState<any>('Received');

  const [serviceCharge, setServiceCharge] = useState<number>(0);
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [warrantyDays, setWarrantyDays] = useState<number>(30);

  // Quick preset custom input
  const [newBrandInput, setNewBrandInput] = useState('');
  const [showNewBrandInput, setShowNewBrandInput] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target as Node)) {
        setClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter clients based on search query (company, person, phone, clientCode)
  const filteredClients = useMemo(() => {
    if (!clientSearchQuery.trim()) return clients;
    const q = clientSearchQuery.toLowerCase();
    return clients.filter((c) =>
      c.company.toLowerCase().includes(q) ||
      c.customerName.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.clientCode.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  }, [clients, clientSearchQuery]);

  // Fetch next sequential Job Number from backend
  useEffect(() => {
    fetch('/api/jobs/next-number')
      .then((res) => res.json())
      .then((data) => {
        if (data.nextJobNumber) {
          setNextJobNumber(data.nextJobNumber);
          setChallan(`CH-${data.nextJobNumber}`);
        }
      })
      .catch(() => {});
  }, []);

  // When client is selected, auto-fill company/name/phone/whatsapp/email
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setCompany(client.company);
      setCustomerName(client.customerName);
      setPhone(client.phone);
      setWhatsapp(client.whatsapp || client.phone);
      setEmail(client.email || '');
      setAddress(client.address || '');
      setClientSearchQuery(`${client.company} (${client.customerName})`);
      setClientDropdownOpen(false);
    } else {
      setClientSearchQuery('');
    }
  };

  const handleClearSelectedClient = () => {
    setSelectedClientId('');
    setClientSearchQuery('');
    setCompany('');
    setCustomerName('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setAddress('');
  };

  // Due calculation: DUE = SERVICE CHARGE - RECEIVED AMOUNT
  const calculatedDue = Math.max(0, (Number(serviceCharge) || 0) - (Number(receivedAmount) || 0));

  // Calculated Warranty Until Date
  const calculateWarrantyUntil = () => {
    const d = new Date();
    d.setDate(d.getDate() + (Number(warrantyDays) || 30));
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!boardSerial.trim()) {
      showToast('Serial Number is required.', 'error');
      return;
    }
    if (!company.trim() && !customerName.trim()) {
      showToast('Company or Customer Name is required.', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        receivedDate,
        deliveryDate,
        clientId: selectedClientId,
        company: company.trim(),
        customerName: customerName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        address: address.trim(),
        brand,
        model,
        boardType,
        boardNumber: boardSerial.trim(),
        boardSerial: boardSerial.trim(),
        problem: problem.trim(),
        remarks: remarks.trim(),
        challan: challan.trim() || `CH-${nextJobNumber}`,
        technician,
        status,
        serviceCharge: Number(serviceCharge) || 0,
        receivedAmount: Number(receivedAmount) || 0,
        warrantyDays: Number(warrantyDays) || 30,
        warrantyUntil: calculateWarrantyUntil(),
        branch: 'Mirpur Head Office',
      };

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create job.');
      }

      showToast(`Repair Job ${data.job.jobNumber} created successfully!`, 'success');
      onJobCreated(data.job);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error creating job', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Inline Quick Add Client
  const handleCreateNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() && !customerName.trim()) {
      showToast('Client company or name is required.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company.trim(),
          customerName: customerName.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim(),
          address: address.trim(),
        }),
      });

      const result = await res.json();
      if (res.ok) {
        onClientCreated(result.client);
        setSelectedClientId(result.client.id);
        setShowAddClientForm(false);
        showToast(`Client ${result.client.company} added!`, 'success');
      }
    } catch (err) {
      showToast('Failed to add client', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">
              +
            </span>
            <div>
              <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
                New Industrial Repair Intake
                <span className="font-mono text-blue-400 font-bold bg-blue-950/80 px-2 py-0.5 rounded text-xs border border-blue-800">
                  {nextJobNumber}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Automatic sequential Job ID · Instant DB & background Google Sheet sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split 7-Col Form + 5-Col Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 max-h-[82vh] overflow-y-auto">
          
          {/* Left Form (7 Cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 p-6 sm:p-7 space-y-6">
            
            {/* Step 1: Client Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                  1. Client / Factory Organization
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddClientForm(!showAddClientForm)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  {showAddClientForm ? 'Select Existing Client' : '+ Add New Client'}
                </button>
              </div>

              {!showAddClientForm ? (
                <div ref={clientDropdownRef} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Choose Existing Client:
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {clients.length} registered
                    </span>
                  </div>

                  {/* Search Input Box */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4 text-blue-600" />
                    </div>

                    <input
                      type="text"
                      value={clientSearchQuery}
                      onChange={(e) => {
                        setClientSearchQuery(e.target.value);
                        setClientDropdownOpen(true);
                      }}
                      onFocus={() => setClientDropdownOpen(true)}
                      placeholder="Type factory name, contact person, or phone number..."
                      className="w-full pl-9 pr-16 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-2xs"
                    />

                    {/* Right action buttons: Clear (X) + Dropdown Toggle (Chevron) */}
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                      {clientSearchQuery && (
                        <button
                          type="button"
                          onClick={handleClearSelectedClient}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                          title="Clear client"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                        title={clientDropdownOpen ? 'Close list' : 'View all clients'}
                      >
                        {clientDropdownOpen ? (
                          <ChevronUp className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Active Selected Client Badge Pill */}
                  {selectedClientId && (
                    <div className="mt-2 p-2 rounded-xl bg-blue-50/90 border border-blue-200 flex items-center justify-between text-xs animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 truncate">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-bold text-blue-900 truncate">
                          {company}
                        </span>
                        {customerName && (
                          <span className="text-blue-700 text-[11px] truncate">
                            ({customerName})
                          </span>
                        )}
                        <span className="text-blue-600 font-mono text-[11px] hidden sm:inline">
                          · {phone}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSelectedClient}
                        className="text-[11px] font-semibold text-rose-600 hover:underline shrink-0 ml-2 cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  {/* Dropdown Results List */}
                  {clientDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3.5 py-1.5 bg-slate-50 text-[10px] font-mono text-slate-500 flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
                        <span>
                          {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} matching
                        </span>
                        <span>Click to auto-fill</span>
                      </div>

                      {filteredClients.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 space-y-2">
                          <p>No matching client found for "{clientSearchQuery}"</p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddClientForm(true);
                              setClientDropdownOpen(false);
                              setCompany(clientSearchQuery);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create new client "{clientSearchQuery}"</span>
                          </button>
                        </div>
                      ) : (
                        filteredClients.map((c) => {
                          const isSelected = c.id === selectedClientId;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleClientSelect(c.id)}
                              className={`w-full text-left p-3 hover:bg-blue-50/70 transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                                isSelected ? 'bg-blue-50/90 border-l-4 border-blue-600' : ''
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-xs truncate">
                                    {c.company}
                                  </span>
                                  <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
                                    {c.clientCode}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-600 mt-0.5 truncate">
                                  Contact: <strong className="text-slate-800">{c.customerName}</strong>
                                </div>
                                {c.address && (
                                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                    {c.address}
                                  </div>
                                )}
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-xs font-mono font-bold text-slate-800 flex items-center justify-end gap-1">
                                  <Phone className="w-3 h-3 text-blue-600" />
                                  <span>{c.phone}</span>
                                </div>
                                {isSelected && (
                                  <span className="text-[10px] font-bold text-blue-600 flex items-center justify-end gap-0.5 mt-1">
                                    <Check className="w-3 h-3" />
                                    Selected
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Client Fields (Auto-filled or manual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Company / Garments Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Ha-Meem Garments Ltd."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Engr. Mahfuzul Alam"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (!whatsapp) setWhatsapp(e.target.value);
                    }}
                    placeholder="e.g. +8801711223344"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    WhatsApp (For Status Alerts)
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. +8801711223344"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Board & Machine Specifications */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                2. Board Brand & Technical Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Brand Preset */}
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Brand Preset *
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    {presets.brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Machine Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. HP-450 MS / DDL-9000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                {/* Board Type */}
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Board Type *
                  </label>
                  <select
                    value={boardType}
                    onChange={(e) => setBoardType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    {presets.boardTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-medium text-slate-900 mb-1">
                  Serial Number *
                </label>
                <input
                  type="text"
                  required
                  value={boardSerial}
                  onChange={(e) => {
                    setBoardSerial(e.target.value);
                    setBoardNumber(e.target.value);
                  }}
                  placeholder="e.g. HSM-2024-9981 / SN-49201 / Barcode"
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-blue-400 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white shadow-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Enter circuit board physical serial number or barcode
                </span>
              </div>

              {/* Problem description */}
              <div className="text-xs">
                <label className="block font-medium text-slate-600 mb-1">
                  Reported Problem / Error Code
                </label>
                <textarea
                  rows={2}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="e.g. Error code E-04, fusing temperature trip, burnt IGBT driver trace..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              {/* Challan & Technician */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Client Challan Number
                  </label>
                  <input
                    type="text"
                    value={challan}
                    onChange={(e) => setChallan(e.target.value)}
                    placeholder={`e.g. CH-${nextJobNumber}`}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Assigned Technician
                  </label>
                  <select
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    {presets.technicians.map((tech) => (
                      <option key={tech} value={tech}>
                        {tech}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Billing, Payments & Warranty */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                3. Financials & Official Warranty
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Estimated Service Bill (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Received Advance (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-emerald-600 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Calculated Due (৳)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`৳${calculatedDue.toLocaleString()}`}
                    className={`w-full px-3 py-2 rounded-xl font-mono font-bold border ${
                      calculatedDue > 0
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}
                  />
                </div>
              </div>

              {/* Warranty Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Warranty Period
                  </label>
                  <div className="flex gap-2">
                    {[30, 45, 60, 90].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setWarrantyDays(d)}
                        className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-semibold cursor-pointer border ${
                          warrantyDays === d
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="Received">Received</option>
                    <option value="Diagnosing">Diagnosing</option>
                    <option value="In Processing">In Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Picked Up">Picked Up</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save & Generate {nextJobNumber}</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Right Column: LIVE ADD JOB PREVIEW (5 Cols) */}
          <div className="lg:col-span-5 p-6 bg-slate-50/70 flex flex-col justify-between">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Live Intake Card Preview
                </span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  Auto-Updating
                </span>
              </div>

              {/* Realistic Job Receipt Preview Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-xs">
                
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">MRS FAST SOLUTIONS</div>
                    <div className="text-[10px] text-slate-500 font-mono">Mirpur-13 Lab & Sales</div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold font-mono text-blue-600">
                      {nextJobNumber}
                    </span>
                    <div className="text-[10px] font-mono text-slate-400">{receivedDate}</div>
                  </div>
                </div>

                {/* Client Block */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Client / Garments:</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {company || customerName || 'Pending Client Entry'}
                  </div>
                  {phone && <div className="text-slate-600 font-mono">{phone}</div>}
                </div>

                {/* Board Specs */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Brand / Model:</span>
                    <span className="font-bold text-slate-800">{brand} {model ? `(${model})` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Board Type:</span>
                    <span className="font-semibold text-slate-700">{boardType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Serial Number:</span>
                    <span className="font-bold text-blue-700">
                      {boardSerial || 'Required *'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Challan:</span>
                    <span className="text-slate-700">{challan || `CH-${nextJobNumber}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Technician:</span>
                    <span className="text-slate-700">{technician}</span>
                  </div>
                </div>

                {/* Problem */}
                {problem && (
                  <div className="text-[11px] text-slate-600 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                    "{problem}"
                  </div>
                )}

                {/* Financials & Due Calculation */}
                <div className="pt-2 border-t border-slate-100 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Bill:</span>
                    <span className="font-bold text-slate-800">৳{serviceCharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Received Advance:</span>
                    <span className="font-bold text-emerald-600">৳{receivedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-slate-100 pt-1">
                    <span className="text-slate-700">Remaining Due:</span>
                    <span className={calculatedDue > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      ৳{calculatedDue.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-1 text-[10px] text-slate-400 text-center font-mono">
                  Official Warranty: {warrantyDays} Days · Status: {status}
                </div>

              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-blue-50/80 border border-blue-200/60 text-xs text-blue-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Saving will generate immutable ID <strong>{nextJobNumber}</strong>, record client association, and enqueue background Google Sheet synchronization safely.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
