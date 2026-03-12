import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function Materials() {

  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {

    const res = await fetch("http://localhost:5000/api/materials");

    const data = await res.json();

    setMaterials(data);

  };

  return (

    <div>

      <Navbar />

      <div className="p-10">

        <h1 className="text-3xl font-bold mb-6">
          Raw Materials
        </h1>

        <table className="w-full border">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-2">Material</th>
              <th className="border p-2">Stock</th>
              <th className="border p-2">Unit</th>

            </tr>

          </thead>

          <tbody>

            {materials.map((m) => (

              <tr key={m.id}>

                <td className="border p-2">{m.name}</td>

                <td className="border p-2">{m.stock}</td>

                <td className="border p-2">{m.unit}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default Materials;