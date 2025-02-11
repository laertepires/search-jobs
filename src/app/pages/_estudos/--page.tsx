import axios from "axios";
export default async function Home() {
  const url = "https://api.inhire.app/job-posts/public/pages";

  const { data } = await axios.get(url, {
    headers: {
      "X-Tenant": "lyncas ",
    },
  });

  console.log("data => ", data);

  return (
    <ul>
      {data.jobsPage.map((_: any) => (
        <li key={_.jobId}>{_.displayName}</li>  
      ))}
    </ul>
  );
}
