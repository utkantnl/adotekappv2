import { cn } from '../lib/utils';
import type { Material } from '../types';
import { useAppStore } from '../store/useAppStore';

interface MaterialSelectorProps {
  selected: Material[];
  onChange: (materials: Material[]) => void;
}

export default function MaterialSelector({
  selected,
  onChange,
}: MaterialSelectorProps) {
  const materials = useAppStore((s) => s.materials);

  const isSelected = (id: string) => selected.some((m) => m.id === id);

  const toggle = (material: Material) => {
    if (isSelected(material.id)) {
      onChange(selected.filter((m) => m.id !== material.id));
    } else {
      onChange([...selected, material]);
    }
  };

  if (materials.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        Henüz malzeme tanımlanmadı.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {materials.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => toggle(m)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200',
            isSelected(m.id)
              ? 'bg-adotek-red text-white border-adotek-red'
              : 'bg-white text-gray-600 border-gray-200 hover:border-adotek-red hover:text-adotek-red'
          )}
        >
          {m.code} — {m.name}
        </button>
      ))}
    </div>
  );
}
