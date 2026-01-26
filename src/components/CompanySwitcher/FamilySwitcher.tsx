import CompanySwitcher from './CompanySwitcher';
import type { ICompany } from '@/types/ICompany';

interface FamilySwitcherProps {
  companies: (ICompany & { role: string })[];
  activeChild?: string;
}

export default function FamilySwitcher({ companies, activeChild }: FamilySwitcherProps) {
  // Simple adapter: map `activeChild` to the existing Company's `activeCompanyId` prop
  return (
    // @ts-ignore existing CompanySwitcher expects activeCompanyId
    <CompanySwitcher companies={companies} activeCompanyId={activeChild || ''} />
  );
}
