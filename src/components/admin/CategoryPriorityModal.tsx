import { useState, useEffect } from "react";
import { X, ArrowUp, ArrowDown, Loader2, Save } from "lucide-react";

interface CategoryPriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  uniqueClasses: string[];
  initialPriorities: string[];
  onSave: (priorities: string[]) => Promise<void>;
}

export function CategoryPriorityModal({
  isOpen,
  onClose,
  uniqueClasses,
  initialPriorities,
  onSave,
}: CategoryPriorityModalProps) {
  const [orderedClasses, setOrderedClasses] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Create an ordered list where saved priorities come first, then remaining classes
      const prioritySet = new Set(initialPriorities);
      const remainingClasses = uniqueClasses.filter((c) => !prioritySet.has(c));
      
      // Filter out priorities that no longer exist in uniqueClasses (optional, but good practice)
      const validPriorities = initialPriorities.filter((c) => uniqueClasses.includes(c));
      
      setOrderedClasses([...validPriorities, ...remainingClasses]);
    }
  }, [isOpen, uniqueClasses, initialPriorities]);

  if (!isOpen) return null;

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...orderedClasses];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    setOrderedClasses(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === orderedClasses.length - 1) return;
    const newOrder = [...orderedClasses];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    setOrderedClasses(newOrder);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(orderedClasses);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al guardar prioridades");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Prioridad de Categorías</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-sm text-gray-500 mb-4">
            Ordena las categorías de arriba hacia abajo para darles prioridad en el catálogo principal.
          </p>
          
          <div className="space-y-2">
            {orderedClasses.length > 0 ? (
              orderedClasses.map((clase, index) => (
                <div 
                  key={clase}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <span className="font-medium text-gray-700 truncate mr-4">
                    <span className="text-gray-400 mr-2">{index + 1}.</span>
                    {clase}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === orderedClasses.length - 1}
                      className="p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No hay categorías disponibles.</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Orden
          </button>
        </div>
      </div>
    </div>
  );
}
