import { useQuery } from "@tanstack/react-query";
import { listMethodologies } from "@/lib/api/methodologies";

export function useMethodologies() {
  return useQuery({
    queryKey: ["methodologies"],
    queryFn: listMethodologies,
  });
}
