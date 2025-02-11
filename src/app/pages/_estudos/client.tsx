import { useEffect, useState } from "react";


export default function Teste() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("https://api.github.com/repos/vercel/next.js");
      const repo = await res.json();
      setData(repo);
    };

    fetchData().catch((e) => {
      // handle the error as needed
      console.error("An error occurred while fetching the data: ", e);
    });
  }, []);

  console.log("client here => ", data);
  return <h1>{"client here " + data?.full_name}</h1>;
}
