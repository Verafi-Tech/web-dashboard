"use client";

import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { SurveyTemplateFormData } from "@/lib/utils/validation";

const FIELD_TYPES = ["boolean", "text", "number", "select", "date"] as const;
type FieldType = (typeof FIELD_TYPES)[number];

function defaultFieldFor(type: FieldType) {
  const base = { key: "", label: "", required: false, help_text: "" };
  if (type === "select") return { ...base, type, options: [""] };
  return { ...base, type };
}

export function FieldBuilder() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SurveyTemplateFormData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "fields",
  });
  // react-hook-form's typed error tree doesn't model array-root issues for a
  // discriminated-union array cleanly, so read the root message loosely here.
  const rootFieldsError = (errors.fields as { root?: { message?: string } } | undefined)
    ?.root;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field, index) => (
            <FieldRow
              key={field.id}
              id={field.id}
              index={index}
              onRemove={() => remove(index)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {fields.length === 0 && (
        <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No fields yet. Add one below.
        </p>
      )}
      {rootFieldsError?.message && (
        <p className="text-xs text-destructive">{rootFieldsError.message}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {FIELD_TYPES.map((type) => (
          <Button
            key={type}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append(defaultFieldFor(type) as SurveyTemplateFormData["fields"][number])}
          >
            <Plus className="size-3.5" />
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
}

function FieldRow({
  id,
  index,
  onRemove,
}: {
  id: string;
  index: number;
  onRemove: () => void;
}) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<SurveyTemplateFormData>();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const type = watch(`fields.${index}.type`);
  // Same rationale as rootFieldsError above: loosely typed to read nested
  // per-field messages regardless of which union variant is active.
  const fieldErrors = errors.fields?.[index] as
    | {
        key?: { message?: string };
        label?: { message?: string };
        options?: { message?: string };
      }
    | undefined;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-border bg-card p-3"
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label="Drag to reorder"
          className="mt-2 cursor-grab text-muted-foreground touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Input
              placeholder="field_key"
              className="font-mono text-xs"
              {...register(`fields.${index}.key`)}
            />
            {fieldErrors?.key && (
              <p className="mt-1 text-[10.5px] text-destructive">
                {fieldErrors.key.message}
              </p>
            )}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Input placeholder="Label" {...register(`fields.${index}.label`)} />
            {fieldErrors?.label && (
              <p className="mt-1 text-[10.5px] text-destructive">
                {fieldErrors.label.message}
              </p>
            )}
          </div>
          <div className="flex items-center sm:col-span-1" title="Type is fixed once added — remove and re-add to change it">
            <Badge variant="draft">{type}</Badge>
          </div>
          <div className="flex items-center gap-2 sm:col-span-1">
            <Controller
              control={control}
              name={`fields.${index}.required`}
              render={({ field: checkboxField }) => (
                <Checkbox
                  checked={checkboxField.value}
                  onCheckedChange={checkboxField.onChange}
                />
              )}
            />
            <span className="text-xs text-muted-foreground">Required</span>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove field"
          onClick={onRemove}
          disabled={isDragging}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <Input
        placeholder="Help text (optional)"
        className="mt-2"
        {...register(`fields.${index}.help_text`)}
      />

      {type === "number" && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            {...register(`fields.${index}.min`, { valueAsNumber: true })}
          />
          <Input
            type="number"
            placeholder="Max"
            {...register(`fields.${index}.max`, { valueAsNumber: true })}
          />
        </div>
      )}

      {type === "select" && (
        <OptionsEditor index={index} errorMessage={fieldErrors?.options?.message} />
      )}
    </div>
  );
}

function OptionsEditor({
  index,
  errorMessage,
}: {
  index: number;
  errorMessage?: string;
}) {
  // useFieldArray/register can't express a path nested inside one variant of
  // a discriminated union array item, so this component works against an
  // untyped form context rather than fighting react-hook-form's FieldPath type.
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `fields.${index}.options`,
  });

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <span className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
        Options
      </span>
      {fields.map((option, optionIndex) => (
        <div key={option.id} className="flex items-center gap-1.5">
          <Input
            placeholder={`Option ${optionIndex + 1}`}
            {...register(`fields.${index}.options.${optionIndex}`)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove option"
            onClick={() => remove(optionIndex)}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ))}
      {errorMessage && (
        <p className="text-[10.5px] text-destructive">{errorMessage}</p>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={() => append("")}
      >
        <Plus className="size-3.5" /> Add option
      </Button>
    </div>
  );
}
