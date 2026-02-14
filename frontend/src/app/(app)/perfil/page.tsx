import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/backend-server";
import { PerfilForm } from "./PerfilForm";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-[640px] mx-auto px-4 md:px-10 py-8">
      <h1 className="text-3xl font-bold text-ink dark:text-white mb-2">Meus dados</h1>
      <p className="text-[#636f88] dark:text-gray-400 mb-8">
        Estes dados podem ser usados nos contratos de locação (como locador ou locatário).
      </p>
      <PerfilForm
        defaultValues={{
          fullName: user.fullName,
          cpf: user.cpf ?? "",
          rg: user.rg ?? "",
          nacionalidade: user.nacionalidade ?? "",
          estadoCivil: user.estadoCivil ?? "",
          profissao: user.profissao ?? "",
          endereco: user.endereco ?? "",
        }}
      />
    </div>
  );
}
