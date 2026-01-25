type LogoProps = {
  className?: string;
  light?: boolean;
};

export function Logo({ className = "", light }: LogoProps) {
  const base = "font-black tracking-tight";
  const aluguel = light ? "text-white" : "text-primary";
  const direto = light ? "text-white" : "text-accent";

  return (
    <span className={`${base} ${className}`.trim()}>
      <span className={aluguel}>Aluguel</span>
      <span className={direto}>Direto</span>
    </span>
  );
}
