import { OrganisationPicker } from "@/components/auth/OrganisationPicker";

export default function SelectOrganisationPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-16">
      <OrganisationPicker />
    </div>
  );
}
