"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("flex gap-1 border-b border-border", className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Tab>) {
  return (
    <TabsPrimitive.Tab
      className={cn(
        // Base UI's Tab sets aria-selected (standard ARIA) plus its own
        // data-active internal attribute — target aria-selected here since
        // it's stable across Base UI versions, unlike the data attribute
        // name (which this component was previously targeting incorrectly
        // as data-[selected], a name Base UI never actually sets).
        "border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-selected:border-primary aria-selected:font-bold aria-selected:text-foreground",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Panel>) {
  return (
    <TabsPrimitive.Panel className={cn("py-4", className)} {...props} />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
