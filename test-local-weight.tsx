// this is just to check logic
const [localWeightStr, setLocalWeightStr] = useState<string | null>(null);

const displayWeightValue = localWeightStr !== null
    ? localWeightStr
    : "10.00"; // fallback
