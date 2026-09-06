"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Nigerian States
const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
];

// Major LGAs by State
const stateLGAs: Record<string, string[]> = {
  'Lagos': ['Ikeja', 'Surulere', 'Yaba', 'Ikorodu', 'Epe', 'Badagry', 'Mushin', 'Oshodi', 'Alimosho', 'Kosofe', 'Shomolu', 'Agege', 'Ajeromi-Ifelodun', 'Amuwo-Odofin', 'Apapa', 'Eti-Osa', 'Ifako-Ijaiye', 'Lagos Island', 'Lagos Mainland', 'Ojo'],
  'Ondo': [
    'Akoko North-East', 'Akoko North-West', 'Akoko South-East', 'Akoko South-West',
    'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 
    'Ilaje', 'Ile Oluji/Okeigbo', 'Irele', 'Odigbo', 
    'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo'
  ],
  'FCT': ['Abuja Municipal', 'Gwagwalada', 'Kuje', 'Bwari', 'Abaji', 'Kwali'],
  'Rivers': ['Port Harcourt', 'Obio-Akpor', 'Okrika', 'Ogu-Bolo', 'Eleme', 'Tai', 'Gokana', 'Khana', 'Asari-Toru', 'Akuku-Toru'],
  'Kano': ['Kano Municipal', 'Fagge', 'Dala', 'Gwale', 'Tarauni', 'Nassarawa', 'Kumbotso', 'Ungogo', 'Kura', 'Madobi'],
  'Oyo': ['Ibadan North', 'Ibadan South-West', 'Ibadan South-East', 'Ibadan North-East', 'Ibadan North-West', 'Egbeda', 'Akinyele', 'Oluyole', 'Ona-Ara', 'Lagelu'],
  'Delta': ['Warri', 'Uvwie', 'Udu', 'Okpe', 'Sapele', 'Ethiope East', 'Ethiope West', 'Ughelli North', 'Ughelli South', 'Bomadi'],
  'Edo': ['Benin City', 'Oredo', 'Egor', 'Uhunmwonde', 'Ovia North-East', 'Ovia South-West', 'Esan North-East', 'Esan South-East', 'Esan Central', 'Esan West'],
  'Ogun': ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North-East', 'Ijebu Ode', 'Remo North'],
  'Osun': ['Osogbo', 'Ede North', 'Ede South', 'Atakumosa East', 'Atakumosa West', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Egbedore'],
  'Kaduna': ['Kaduna North', 'Kaduna South', 'Igabi', 'Kaura', 'Sanga', 'Jema\'a', 'Anchau', 'Kachia', 'Kagarko', 'Kajuru'],
  'Katsina': ['Katsina', 'Daura', 'Funtua', 'Malumfashi', 'Mashi', 'Bindawa', 'Charanchi', 'Dandume', 'Danja', 'Dan Musa'],
  'Sokoto': ['Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Gudu', 'Wurno', 'Illela', 'Binji', 'Kebbe', 'Shagari'],
  'Kwara': ['Ilorin East', 'Ilorin South', 'Ilorin West', 'Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Irepodun', 'Isin'],
  'Enugu': ['Enugu East', 'Enugu North', 'Enugu South', 'Awgu', 'Aninri', 'Nkanu East', 'Nkanu West', 'Udi', 'Oji River', 'Ezeagu'],
  'Anambra': ['Awka North', 'Awka South', 'Onitsha North', 'Onitsha South', 'Nnewi North', 'Nnewi South', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ogbaru'],
  'Imo': ['Owerri Municipal', 'Owerri North', 'Owerri West', 'Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South', 'Ihitte/Uboma'],
  'Abia': ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia'],
  'Ebonyi': ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi'],
  'Benue': ['Makurdi', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Mbamtor', 'Ogbadibo'],
  'Nasarawa': ['Lafia', 'Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Nasarawa', 'Nasarawa Egon'],
  'Niger': ['Minna', 'Bida', 'Kontagora', 'Suleja', 'Bosso', 'Chanchaga', 'Mokwa', 'Agaie', 'Baro', 'Edati'],
  'Plateau': ['Jos North', 'Jos South', 'Jos East', 'Bokkos', 'Barkin Ladi', 'Bassa', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South'],
  'Adamawa': ['Yola North', 'Yola South', 'Girei', 'Demsa', 'Fufore', 'Ganaye', 'Gombi', 'Guyuk', 'Hong', 'Jada'],
  'Taraba': ['Jalingo', 'Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Karim Lamido', 'Lau', 'Sardauna'],
  'Bauchi': ['Bauchi', 'Alkaleri', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Ganjuwa', 'Giade', 'Itas/Gadau'],
  'Borno': ['Maiduguri', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala'],
  'Yobe': ['Damaturu', 'Bade', 'Bursari', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Karasuwa'],
  'Gombe': ['Gombe', 'Akko', 'Balanga', 'Billiri', 'Dukku', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'],
  'Jigawa': ['Dutse', 'Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Gagarawa', 'Garki', 'Gumel', 'Guri'],
  'Kebbi': ['Birnin Kebbi', 'Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Dandi', 'Fakai', 'Gwandu', 'Jega'],
  'Zamfara': ['Gusau', 'Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Kaura Namoda', 'Maradun'],
  'Bayelsa': ['Yenagoa', 'Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw'],
  'Cross River': ['Calabar Municipal', 'Calabar South', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Biase', 'Boki', 'Etung', 'Ikom', 'Obanliku'],
  'Akwa Ibom': ['Uyo', 'Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan']
};

export default function AdminAddLocation() {
  const router = useRouter();
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableLGAs, setAvailableLGAs] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    state: '',
    city: '', // This will store the LGA
    town: '',
    contact_name: '',
    contact_phone: '',
    owner_id: ''
  });

  useEffect(() => {
    fetchOwners();
  }, []);

  useEffect(() => {
    // Update LGAs when state changes
    if (formData.state && stateLGAs[formData.state]) {
      setAvailableLGAs(stateLGAs[formData.state]);
      setFormData(prev => ({ ...prev, city: '' })); // Reset LGA when state changes
    } else {
      setAvailableLGAs([]);
    }
  }, [formData.state]);

  const fetchOwners = async () => {
    const { data } = await supabase.from('location_owners').select('id, business_name');
    if (data) setOwners(data);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('locations').insert([{
      ...formData,
      status: 'active',
      is_visible_on_map: true,
      created_at: new Date().toISOString()
    }]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Location added successfully!');
      router.push('/admin/locations');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box' as const
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Add New Location</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Create a new power bank station</p>

      <form onSubmit={handleSubmit}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Location Name *</label>
        <input 
          style={inputStyle}
          type="text"
          placeholder="e.g., J&D Babies Store"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Full Address *</label>
        <textarea 
          style={{...inputStyle, minHeight: '80px'}}
          placeholder="e.g., 167, old ore-benin road"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          required
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>State *</label>
        <select 
          style={inputStyle}
          value={formData.state}
          onChange={(e) => setFormData({...formData, state: e.target.value})}
          required
        >
          <option value="">Select State</option>
          {nigerianStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Local Government (LGA) *</label>
        <select 
          style={inputStyle}
          value={formData.city}
          onChange={(e) => setFormData({...formData, city: e.target.value})}
          disabled={!formData.state}
          required
        >
          <option value="">Select LGA</option>
          {availableLGAs.map(lga => (
            <option key={lga} value={lga}>{lga}</option>
          ))}
        </select>

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Town/Area</label>
        <input 
          style={inputStyle}
          type="text"
          placeholder="e.g., Show boy, Ore"
          value={formData.town}
          onChange={(e) => setFormData({...formData, town: e.target.value})}
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Contact Person Name</label>
        <input 
          style={inputStyle}
          type="text"
          placeholder="e.g., Victor"
          value={formData.contact_name}
          onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Contact Phone</label>
        <input 
          style={inputStyle}
          type="tel"
          placeholder="e.g., 08035289512"
          value={formData.contact_phone}
          onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Assign to Owner *</label>
        <select 
          style={inputStyle}
          value={formData.owner_id}
          onChange={(e) => setFormData({...formData, owner_id: e.target.value})}
          required
        >
          <option value="">-- Select Owner --</option>
          {owners.map(owner => (
            <option key={owner.id} value={owner.id}>{owner.business_name}</option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading ? '#999' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create Location'}
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/admin/locations" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Locations</a>
      </div>
    </main>
  );
}
