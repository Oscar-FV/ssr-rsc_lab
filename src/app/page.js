import { redirect } from "next/navigation";

export default function Home() {
  redirect("/pokemon");
  return null;
}