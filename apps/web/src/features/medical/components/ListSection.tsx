import { useState, type ReactNode } from 'react';
import type { z } from 'zod';
import type { MedicalProfileSection } from '@nexuscare/shared';
import {
  ListEditor,
  type ListField,
  type ListItemValues,
} from '../../../components/forms/ListEditor';
import { SectionCard } from '../../../components/common/SectionCard';
import { useToast } from '../../../components/ui/toast-context';
import { useUpdateMedicalSection } from '../api';

export interface ListSectionProps<T> {
  section: MedicalProfileSection;
  title: string;
  description: string;
  icon: ReactNode;
  itemLabel: string;
  items: T[];
  fields: ListField[];
  schema: z.ZodType<unknown, { items: ListItemValues[] }>;
  emptyItem: ListItemValues;
  maxItems: number;
  toFormItem: (item: T) => ListItemValues;
  renderItem: (item: T) => ReactNode;
  emptyText: string;
}

/** A medical-profile list (view mode + list editor) saved as one section. */
export function ListSection<T extends { id: string }>({
  section,
  title,
  description,
  icon,
  itemLabel,
  items,
  fields,
  schema,
  emptyItem,
  maxItems,
  toFormItem,
  renderItem,
  emptyText,
}: ListSectionProps<T>) {
  const [editing, setEditing] = useState(false);
  const save = useUpdateMedicalSection(section);
  const { toast } = useToast();

  return (
    <SectionCard
      id={section}
      title={title}
      description={description}
      icon={icon}
      editing={editing}
      onEdit={() => {
        setEditing(true);
      }}
    >
      {editing ? (
        <ListEditor
          itemLabel={itemLabel}
          fields={fields}
          schema={schema}
          initialItems={items.map(toFormItem)}
          emptyItem={emptyItem}
          maxItems={maxItems}
          onCancel={() => {
            setEditing(false);
          }}
          onSave={async (next) => {
            await save.mutateAsync({ items: next });
            setEditing(false);
            toast({ tone: 'success', title: `${title} saved` });
          }}
        />
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="py-3 first:pt-0 last:pb-0">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
