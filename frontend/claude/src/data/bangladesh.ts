/**
 * Bangladesh administrative locations for the checkout address form.
 * Divisions and all 64 districts are complete. Areas/thanas are included for
 * high-volume districts only; for other districts the form shows a free-text
 * "Area / Upazila" field. Codex can replace this with a courier's location API
 * (e.g. Pathao / Steadfast / RedX area endpoints) during integration.
 */
export const DIVISIONS: Record<string, string[]> = {
  Dhaka: ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
  Chattogram: ["Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Cox's Bazar", "Cumilla", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati"],
  Rajshahi: ["Bogura", "Chapai Nawabganj", "Joypurhat", "Naogaon", "Natore", "Pabna", "Rajshahi", "Sirajganj"],
  Khulna: ["Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
  Barishal: ["Barguna", "Barishal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
  Sylhet: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
  Rangpur: ["Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon"],
  Mymensingh: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
};

export const AREAS: Record<string, string[]> = {
  Dhaka: [
    "Adabor", "Badda", "Banani", "Bangshal", "Cantonment", "Dakshinkhan", "Demra", "Dhamrai", "Dhanmondi", "Dohar", "Gulshan",
    "Hazaribagh", "Jatrabari", "Kadamtali", "Kafrul", "Kalabagan", "Kamrangirchar", "Keraniganj", "Khilgaon", "Khilkhet", "Kotwali",
    "Lalbagh", "Mirpur", "Mohammadpur", "Motijheel", "Nawabganj", "New Market", "Pallabi", "Paltan", "Ramna", "Rampura", "Sabujbagh",
    "Savar", "Shah Ali", "Shahbagh", "Sher-e-Bangla Nagar", "Shyampur", "Sutrapur", "Tejgaon", "Turag", "Uttara", "Uttarkhan", "Wari",
  ],
  Chattogram: ["Agrabad", "Bakalia", "Bayazid", "Chandgaon", "Double Mooring", "Halishahar", "Hathazari", "Khulshi", "Kotwali", "Pahartali", "Panchlaish", "Patenga", "Patiya", "Sitakunda"],
  Gazipur: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur", "Tongi"],
  Narayanganj: ["Araihazar", "Bandar", "Fatullah", "Narayanganj Sadar", "Rupganj", "Siddhirganj", "Sonargaon"],
  Sylhet: ["Ambarkhana", "Beanibazar", "Companiganj", "Golapganj", "Sylhet Sadar", "Zindabazar"],
};

export const divisionNames = Object.keys(DIVISIONS);

export function districtsOf(division: string): string[] {
  return DIVISIONS[division] ?? [];
}

export function areasOf(district: string): string[] {
  return AREAS[district] ?? [];
}

/** Delivery is "inside Dhaka" only for Dhaka district. */
export function isInsideDhaka(district: string): boolean {
  return district === "Dhaka";
}
