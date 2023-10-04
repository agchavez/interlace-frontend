interface OutputType {
  name: string;
  rows: OutputTypeDataRow[];
}

interface OutputTypeDataRow {
  material: string;
  description: string;
  quantity: number;
}

const outputTypeDataToShow: OutputType[] = [
  {
    name: "Pallets de Madera",
    rows: [
      {
        material: "3501451",
        description: "PALLET DE MADERA",
        quantity: 390,
      },
    ],
  },
  {
    name: "Envase de Cerveza 12OZ - 28",
    rows: [
      {
        material: "3501590",
        description: "Juego de envase Cer 12oz",
        quantity: 1372,
      },
      {
        material: "3501451",
        description: "PALLET DE MADERA",
        quantity: 28,
      },
    ],
  },
  {
    name: "Envase de Cerveza 12OZ - 30",
    rows: [
      {
        material: "3501590",
        description: "Juego de envase Cer 12oz",
        quantity: 1470,
      },
      {
        material: "3501451",
        description: "PALLET DE MADERA",
        quantity: 30,
      },
    ],
  },
  {
    name: "Envase de Cerveza 25OZ - 28",
    rows: [
      {
        material: "3501592",
        description: "Juego de envase Cer 25oz",
        quantity: 1008,
      },
      {
        material: "3501451",
        description: "PALLET DE MADERA",
        quantity: 28,
      },
    ],
  },
  {
    name: "Envase de Cerveza 25OZ - 30",
    rows: [
      {
        material: "3501592",
        description: "Juego de envase Cer 25oz",
        quantity: 1080,
      },
      {
        material: "3501451",
        description: "PALLET DE MADERA",
        quantity: 30,
      },
    ],
  },
  {
    name: "Envase de Refresco 1.25LT VR - 28",
    rows: [
      {
        material: "3501601",
        description: "Juego de Ref 1 Litro",
        quantity: 980,
      },
      {
        material: "3501451",
        description: "PALLET DE MADERA",
        quantity: 28,
      },
    ],
  },
  {
    name: "Envase de Refresco 12OZ - 28",
    rows: [
      {
        material: "3501596",
        description: "Juego de envase REF 12oz",
        quantity: 1008,
      },
      {
        material: "3501601",
        description: "Juego de Ref 1 Litro",
        quantity: 140,
      },
      {
        material: "3501451",
        description: "PALLET DE MADERA",
        quantity: 28,
      },
    ],
  },
];

export default outputTypeDataToShow;
