// Mapa de unidades por categoría.
// Cada categoría usa una UNIDAD BASE y factores multiplicativos hacia esa base.
// Ej.: en LONGITUD la base es metro (m). 1 ft = 0.3048 m.
const CATEGORIES = {
  length: {
    label: "Longitud",
    base: "m",
    units: {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      in: 0.0254,     // pulgada
      ft: 0.3048,     // pie
      yd: 0.9144,     // yarda
      mi: 1609.344    // milla
    },
    display: {
      m: "Metro (m)", km: "Kilómetro (km)", cm: "Centímetro (cm)", mm: "Milímetro (mm)",
      in: "Pulgada (in)", ft: "Pie (ft)", yd: "Yarda (yd)", mi: "Milla (mi)"
    }
  },
  mass: {
    label: "Masa",
    base: "kg",
    units: {
      kg: 1,
      g: 0.001,
      mg: 1e-6,
      lb: 0.45359237,        // libra avoirdupois
      oz: 0.028349523125,    // onza
      t: 1000                // tonelada métrica
    },
    display: {
      kg: "Kilogramo (kg)", g: "Gramo (g)", mg: "Miligramo (mg)",
      lb: "Libra (lb)", oz: "Onza (oz)", t: "Tonelada (t)"
    }
  },
  speed: {
    label: "Velocidad",
    base: "m/s",
    units: {
      "m/s": 1,
      "km/h": 1000/3600, // 0.277777...
      mph: 0.44704       // milla por hora
      // Puedes añadir knot: 0.514444 si lo necesitas
    },
    display: {
      "m/s": "Metro por segundo (m/s)",
      "km/h": "Kilómetro por hora (km/h)",
      mph: "Milla por hora (mph)"
    }
  },
  energy: {
    label: "Energía",
    base: "J",
    units: {
      J: 1,
      cal: 4.184,      // caloría pequeña (gram calorie)
      kcal: 4184,      // kilocaloría (Caloría alimentaria)
      Wh: 3600,        // Watt-hora
      kWh: 3.6e6
    },
    display: {
      J: "Joule (J)",
      cal: "Caloría (cal)",
      kcal: "Kilocaloría (kcal)",
      Wh: "Watt-hora (Wh)",
      kWh: "Kilowatt-hora (kWh)"
    }
  }
  // Si quieres añadir TEMPERATURA, requiere fórmulas (no solo factor).
};

// --------- DOM ----------
const $category = document.getElementById("category");
const $fromUnit = document.getElementById("fromUnit");
const $toUnit   = document.getElementById("toUnit");
const $amount   = document.getElementById("amount");
const $result   = document.getElementById("result");
const $swap     = document.getElementById("swap");
const $convert  = document.getElementById("convert");

// Inicializa categorías y selecciona una por defecto
(function init() {
  Object.entries(CATEGORIES).forEach(([key, cfg]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = cfg.label;
    $category.appendChild(opt);
  });
  $category.value = "length"; // por defecto
  populateUnits();
  attachEvents();
})();

function populateUnits() {
  const cfg = CATEGORIES[$category.value];
  // Reset
  $fromUnit.innerHTML = "";
  $toUnit.innerHTML = "";

  Object.keys(cfg.units).forEach((u, idx) => {
    const opt1 = document.createElement("option");
    const opt2 = document.createElement("option");
    opt1.value = opt2.value = u;
    opt1.textContent = opt2.textContent = cfg.display?.[u] || u;
    $fromUnit.appendChild(opt1);
    $toUnit.appendChild(opt2);
  });

  // Valores por defecto razonables por categoría
  const defaults = {
    length: { from: "m", to: "ft" },
    mass:   { from: "kg", to: "lb" },
    speed:  { from: "m/s", to: "km/h" },
    energy: { from: "J", to: "kcal" }
  };
  const d = defaults[$category.value];
  if (d) {
    $fromUnit.value = d.from;
    $toUnit.value   = d.to;
  }
  maybeConvert();
}

function attachEvents() {
  $category.addEventListener("change", populateUnits);
  $fromUnit.addEventListener("change", maybeConvert);
  $toUnit.addEventListener("change", maybeConvert);
  $amount.addEventListener("input", maybeConvert);
  $amount.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doConvert();
  });
  $convert.addEventListener("click", doConvert);
  $swap.addEventListener("click", () => {
    const tmp = $fromUnit.value;
    $fromUnit.value = $toUnit.value;
    $toUnit.value = tmp;
    maybeConvert();
  });
}

function maybeConvert() {
  const v = parseFloat($amount.value);
  if (!isNaN(v)) doConvert();
  else $result.textContent = "—";
}

function doConvert() {
  const cat = $category.value;
  const cfg = CATEGORIES[cat];
  const from = $fromUnit.value;
  const to   = $toUnit.value;
  const amount = parseFloat($amount.value);

  if (isNaN(amount)) {
    $result.textContent = "Ingresa un número válido.";
    return;
  }

  // Conversión multiplicativa vía unidad base.
  // valor_base = amount * factor(from)
  // resultado  = valor_base / factor(to)
  const factorFrom = cfg.units[from];
  const factorTo   = cfg.units[to];
  const valueInBase = amount * factorFrom;
  const output = valueInBase / factorTo;

  $result.textContent = `${format(amount)} ${labelOf(cfg, from)} = ${format(output)} ${labelOf(cfg, to)}`;
}

function format(n) {
  // Formato amigable: usa hasta 8 cifras significativas y recorta ceros.
  if (Math.abs(n) === 0) return "0";
  const s = Number(n).toPrecision(8);
  return parseFloat(s).toString();
}

function labelOf(cfg, unitKey) {
  return (cfg.display && cfg.display[unitKey]) ? cfg.display[unitKey] : unitKey;
}
