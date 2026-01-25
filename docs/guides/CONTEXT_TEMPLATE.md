# CONTEXT.md — Modelo para pastas do source

Use este modelo em **cada pasta significativa** de `aluguel-direto/backend/`, `aluguel-direto/frontend/` e `aluguel-direto/shared/`. O ficheiro deve chamar-se `CONTEXT.md` e ficar na raiz da pasta.

---

## Propósito

Breve descrição do que esta pasta representa (ex.: Bounded Context Identity, camada application, componentes de layout).

---

## Padrões utilizados

- Padrões de projeto (Repository, Factory, etc.).
- Convenções de nome, erros, injeção.
- Ex.: "Repositórios expostos como interfaces em `repositories/`; implementações em `infrastructure/persistence/`."

---

## Snippets relevantes

Trechos de código ou configuração que servem de referência.

```typescript
// Exemplo: assinatura de um repositório
export interface IPropertyRepository {
  save(property: Property): Promise<Property>;
  findById(id: string): Promise<Property | null>;
  findByOwner(ownerId: string): Promise<Property[]>;
}
```

---

## Dependências

- **Depende de:** que pastas ou módulos esta pasta usa.
- **Não pode ser usada por:** restrições (ex.: `domains/` não é importado por `app/`).

---

## Referências

- [BUILD_SPEC](../BUILD_SPEC.md)
- [specs/backend](../../specs/backend/spec.md) / [specs/frontend](../../specs/frontend/spec.md)
- ADRs em [decisions/adrs](../decisions/adrs/)
