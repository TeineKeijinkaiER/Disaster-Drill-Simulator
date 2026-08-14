export interface LaboratoryRow {
  item: string;
  value: string;
  reference: string;
}

export interface PatientLaboratoryResults {
  bloodGas?: LaboratoryRow[];
  specimen?: LaboratoryRow[];
}

// Retrieved from the Notion training-case database on 2026-08-14.
export const laboratoryResultsByPatientId: Record<number, PatientLaboratoryResults> = {
  "1": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.29",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "68 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "31 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "15 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "\u221210 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "52.2 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "8.2 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "139 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "3.9 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "107 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.02 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "156 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "14,200 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "285\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "8.2 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "25.0 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "14.2\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.3",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "38 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "148 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "45.0 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "92 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "2": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.26",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "88 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "30 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "14 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "\u221212 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "58.5 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "7.5 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "140 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.1 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "108 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "0.98 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "168 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "15,200 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "260\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "7.5 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "23.0 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "12.0\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.4",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "42 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "128 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "62 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "130 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "3": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.31",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "92 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "47 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "23 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "\u22121 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "21.6 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "13.6 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "141 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "3.8 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "104 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.16 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "182 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "13,500 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "470\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "13.6 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "41 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "22\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.1",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "30 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "285 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "8 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "\\<5 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "13": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.30",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "84 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "34 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "17 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "\u22128 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "40.5 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "9.5 g/dL",
        "reference": "13\u201316\uff08\u5c0f\u5150\uff09"
      },
      {
        "item": "Na\u207a",
        "value": "142 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "3.9 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "106 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.05 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "190 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "16,200 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "330\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "9.5 g/dL",
        "reference": "13\u201316"
      },
      {
        "item": "Ht",
        "value": "29 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "15\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.3",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "40 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "158 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "55 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "110 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "14": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.33",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "92 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "33 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "18 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "\u22126 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "32.4 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "10.6 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "140 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.0 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "106 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.10 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "145 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "12,400 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "360\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "10.6 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "32 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "18\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.2",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "34 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "210 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "30 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "60 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "19": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.40",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "95 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "40 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "24 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "0 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "13.5 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "13.0 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "140 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.0 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "104 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.20 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "118 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "9,500 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "450\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "13.0 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "40 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "24\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.0",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "30 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "300 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "5 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "\\<5 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "21": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.42",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "86 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "40 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "25 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "+1 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "10.8 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "12.5 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "139 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.2 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "103 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.18 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "110 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "7,500 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "420\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "12.5 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "38 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "22\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.0",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "31 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "320 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "6 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "\\<5 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "22": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.41",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "82 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "42 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "25 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "+0.5 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "12.6 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "13.2 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "140 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.0 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "104 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.19 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "115 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "9,000 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "455\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "13.2 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "41 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "23\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.0",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "30 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "300 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "8 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "\\<5 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "23": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.40",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "94 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "40 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "24 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "0 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "11.7 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "12.8 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "140 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.1 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "105 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.20 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "112 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "8,500 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "440\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "12.8 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "39 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "24\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.0",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "30 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "310 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "6 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "\\<5 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "24": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.41",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "86 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "41 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "25 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "+1 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "12.6 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "12.6 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "140 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.0 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "104 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.18 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "120 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "8,000 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "430\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "12.6 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "38 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "20\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "2.8",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "40 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "280 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "10 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "6 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "35": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.22",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "58 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "50 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "18 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "\u22129 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "54.0 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "9.0 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "139 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.2 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "105 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.00 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "175 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "15,000 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "305\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "9.0 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "27 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "13\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.3",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "40 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "150 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "50 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "100 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "36": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.30",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "55 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "55 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "27 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "+2 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "18.0 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "12.0 g/dL",
        "reference": "12\u201316\uff08\u5c0f\u5150\uff09"
      },
      {
        "item": "Na\u207a",
        "value": "139 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.3 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "100 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.15 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "110 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "11,000 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "420\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "12.0 g/dL",
        "reference": "12\u201316"
      },
      {
        "item": "Ht",
        "value": "37 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "30\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.0",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "32 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "300 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "6 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "\\<5 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "38": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.42",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "90 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "39 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "25 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "+1 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "11.7 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "13.5 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "140 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.0 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "103 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.20 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "132 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "8,500 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "460\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "13.5 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "42 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "25\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.0",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "30 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "320 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "7 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "\\<5 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "39": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.44",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "92 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "36 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "24 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "0 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "19.8 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "14.0 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "143 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "3.5 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "104 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.18 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "120 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "14,000 /\u00b5L\uff08\u5de6\u65b9\u79fb\u52d5\uff09",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "480\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "14.0 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "44 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "28\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.1",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "30 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "380 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "8 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "\\<5 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "40": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.27",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "90 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "31 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "15 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "\u221211 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "55.8 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "8.0 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "140 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.2 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "107 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.00 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "165 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "15,200 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "275\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "8.0 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "24 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "12\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.4",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "42 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "130 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "70 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "145 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "41": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.46",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "52 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "30 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "22 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "\u22121 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "18.0 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "11.5 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "139 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.0 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "103 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.15 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "130 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "12,000 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "400\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "11.5 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "35 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "9.0\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.2",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "34 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "250 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "25 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "45 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "45": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.34",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "85 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "36 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "19 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "\u22125 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "31.5 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "13.5 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "139 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.4 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "104 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.15 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "155 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "12,000 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "460\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "13.5 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "42 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "23\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.1",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "30 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "D-dimer",
        "value": "8 \u00b5g/mL",
        "reference": "\\<1.0"
      }
    ]
  },
  "46": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.20",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "54 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "55 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "17 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "\u221210 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "63.0 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "10.5 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "139 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.5 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "105 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "0.98 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "180 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "16,000 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "355\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "10.5 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "32 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "15\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.3",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "38 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "180 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "40 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "85 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "47": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.28",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "90 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "30 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "14 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "\u221212 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "36.0 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "14.0 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "137 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "6.8 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "102 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "0.95 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "130 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "13,000 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "470\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "14.0 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "43 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "18\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.2",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "32 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "300 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "15 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "20 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "48": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.40",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "96 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "38 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "23 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "\u22121 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "16.2 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "12.5 g/dL",
        "reference": "12\u201316\uff08\u5c0f\u5150\uff09"
      },
      {
        "item": "Na\u207a",
        "value": "140 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.0 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "104 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.18 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "120 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "11,000 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "440\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "12.5 g/dL",
        "reference": "12\u201316"
      },
      {
        "item": "Ht",
        "value": "38 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "28\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.1",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "32 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "280 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "12 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "\\<5 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  },
  "50": {
    "bloodGas": [
      {
        "item": "pH",
        "value": "7.38",
        "reference": "7.35\u20137.45"
      },
      {
        "item": "pO\u2082",
        "value": "90 mmHg",
        "reference": "80\u2013100"
      },
      {
        "item": "pCO\u2082",
        "value": "40 mmHg",
        "reference": "35\u201345"
      },
      {
        "item": "HCO\u2083\u207b",
        "value": "23 mmol/L",
        "reference": "22\u201326"
      },
      {
        "item": "BE",
        "value": "\u22121 mmol/L",
        "reference": "\u22122\u301c+2"
      },
      {
        "item": "Lac\uff08\u4e73\u9178\uff09",
        "value": "18.0 mg/dL",
        "reference": "4.5\u201314.4"
      },
      {
        "item": "Hb",
        "value": "11.5 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Na\u207a",
        "value": "140 mmol/L",
        "reference": "138\u2013145"
      },
      {
        "item": "K\u207a",
        "value": "4.1 mmol/L",
        "reference": "3.6\u20134.8"
      },
      {
        "item": "Cl\u207b",
        "value": "105 mmol/L",
        "reference": "101\u2013108"
      },
      {
        "item": "iCa\u00b2\u207a",
        "value": "1.15 mmol/L",
        "reference": "1.15\u20131.30"
      },
      {
        "item": "Glu",
        "value": "135 mg/dL",
        "reference": "73\u2013109"
      }
    ],
    "specimen": [
      {
        "item": "WBC",
        "value": "13,000 /\u00b5L",
        "reference": "3,300\u20138,600"
      },
      {
        "item": "RBC",
        "value": "400\u4e07 /\u00b5L",
        "reference": "435\u2013555\u4e07"
      },
      {
        "item": "Hb",
        "value": "11.5 g/dL",
        "reference": "13\u201317"
      },
      {
        "item": "Ht",
        "value": "35 %",
        "reference": "40\u201350"
      },
      {
        "item": "Plt",
        "value": "20\u4e07 /\u00b5L",
        "reference": "15.8\u201334.8\u4e07"
      },
      {
        "item": "PT-INR",
        "value": "1.1",
        "reference": "0.9\u20131.1"
      },
      {
        "item": "APTT",
        "value": "32 \u79d2",
        "reference": "24\u201334"
      },
      {
        "item": "Fib",
        "value": "300 mg/dL",
        "reference": "200\u2013400"
      },
      {
        "item": "D-dimer",
        "value": "15 \u00b5g/mL",
        "reference": "\\<1.0"
      },
      {
        "item": "FDP",
        "value": "10 \u00b5g/mL",
        "reference": "\\<5"
      }
    ]
  }
};

