import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, ImagePlusIcon, Loader2Icon, StarIcon, Trash2Icon, UploadIcon, XIcon } from "lucide-react";
import { useLayoutEffect, useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { errorMessage } from "@/api/client";
import { uploadMedia } from "@/api/hooks";
import type { ProductImage } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/i18n/ru";
import { cn } from "@/lib/utils";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

function validate(file: File): string | null {
  if (!ACCEPT.includes(file.type)) return t.images.badType;
  if (file.size > MAX_BYTES) return t.images.tooLarge;
  return null;
}

function useDropzone(onFiles: (files: File[]) => void) {
  const [over, setOver] = useState(false);
  return {
    over,
    props: {
      onDragOver: (e: DragEvent) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setOver(true);
      },
      onDragLeave: () => setOver(false),
      onDrop: (e: DragEvent) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        setOver(false);
        onFiles(Array.from(e.dataTransfer.files));
      },
    },
  };
}

// ---------- multi image gallery (products) ----------

interface Item extends ProductImage {
  key: string;
}

let keySeq = 0;
const withKey = (img: ProductImage): Item => ({ ...img, key: `img${++keySeq}` });

/** Ordered product gallery. The first image is the main one. Drag (mouse/touch/keyboard) to reorder. */
export function ImageGalleryUpload({
  value,
  onChange,
  max = 20,
}: {
  value: ProductImage[];
  onChange: (v: ProductImage[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  // Stable keys for dnd; re-derived when the parent replaces the array (reset/load).
  const [items, setItems] = useState<Item[]>(() => value.map(withKey));
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    const same = value.length === items.length && value.every((v, i) => v.url === items[i]?.url && v.alt === items[i]?.alt);
    if (!same) setItems(value.map((v, i) => (items[i]?.url === v.url ? { ...v, key: items[i]!.key } : withKey(v))));
  }

  // Uploads finish asynchronously; read the freshest list via ref.
  const itemsRef = useRef(items);
  useLayoutEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const commit = (next: Item[]) => {
    itemsRef.current = next;
    setItems(next);
    const plain = next.map(({ url, alt }) => ({ url, alt }));
    setLastValue(plain);
    onChange(plain);
  };

  const handleFiles = async (files: File[]) => {
    const room = max - itemsRef.current.length - uploading;
    if (room <= 0) {
      toast.error(t.images.max);
      return;
    }
    const accepted: File[] = [];
    for (const f of files.slice(0, room)) {
      const err = validate(f);
      if (err) toast.error(`${f.name}: ${err}`);
      else accepted.push(f);
    }
    if (files.length > room) toast.error(t.images.max);
    setUploading((n) => n + accepted.length);
    await Promise.all(
      accepted.map(async (f) => {
        try {
          const res = await uploadMedia(f);
          commit([...itemsRef.current, withKey({ url: res.url, alt: null })]);
        } catch (e) {
          toast.error(`${f.name}: ${errorMessage(e)}`);
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
  };

  const dz = useDropzone((f) => void handleFiles(f));
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.key === active.id);
    const to = items.findIndex((i) => i.key === over.id);
    commit(arrayMove(items, from, to));
  };

  const full = items.length + uploading >= max;

  return (
    <div className="grid gap-3" {...dz.props}>
      {items.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.key)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((img, i) => (
                <SortableImage
                  key={img.key}
                  item={img}
                  index={i}
                  onAlt={(alt) => commit(items.map((x) => (x.key === img.key ? { ...x, alt: alt || null } : x)))}
                  onRemove={() => commit(items.filter((x) => x.key !== img.key))}
                  onMakeMain={() => commit(arrayMove(items, i, 0))}
                />
              ))}
              {Array.from({ length: uploading }, (_, i) => (
                <div key={`u${i}`} className="flex aspect-square items-center justify-center rounded-lg border border-dashed bg-muted/40">
                  <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      {items.length === 0 && uploading > 0 && (
        <div className="flex h-24 items-center justify-center gap-2 rounded-lg border border-dashed text-[13px] text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          {t.images.uploading}
        </div>
      )}
      {!full && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-6 text-center transition-colors hover:border-primary/60 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
            dz.over && "border-primary bg-primary/5",
          )}
        >
          <ImagePlusIcon className="size-5 text-muted-foreground" />
          <span className="text-[13px] font-medium">{t.images.drop}</span>
          <span className="text-xs text-muted-foreground">{t.images.formats}</span>
        </button>
      )}
      {items.length > 1 && <p className="text-xs text-muted-foreground">{t.images.reorderHint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        multiple
        hidden
        onChange={(e) => {
          void handleFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
    </div>
  );
}

function SortableImage({
  item,
  index,
  onAlt,
  onRemove,
  onMakeMain,
}: {
  item: Item;
  index: number;
  onAlt: (alt: string) => void;
  onRemove: () => void;
  onMakeMain: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.key });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group relative overflow-hidden rounded-lg border bg-card", isDragging && "z-10 shadow-lg ring-2 ring-primary")}
    >
      <div className="relative aspect-square bg-muted/40">
        <img src={item.url} alt={item.alt ?? ""} className="size-full object-contain" loading="lazy" draggable={false} />
        <button
          type="button"
          className="absolute top-1.5 left-1.5 flex size-7 cursor-grab touch-none items-center justify-center rounded-md bg-background/85 text-muted-foreground shadow-sm backdrop-blur hover:text-foreground active:cursor-grabbing"
          aria-label={`${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-4" />
        </button>
        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
          {index > 0 && (
            <Button variant="secondary" size="icon-xs" className="bg-background/85 backdrop-blur" onClick={onMakeMain} aria-label={t.images.main}>
              <StarIcon />
            </Button>
          )}
          <Button variant="secondary" size="icon-xs" className="bg-background/85 text-destructive backdrop-blur" onClick={onRemove} aria-label={t.images.remove}>
            <Trash2Icon />
          </Button>
        </div>
        {index === 0 && (
          <span className="absolute bottom-1.5 left-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground uppercase">
            {t.images.main}
          </span>
        )}
      </div>
      <Input
        value={item.alt ?? ""}
        onChange={(e) => onAlt(e.target.value)}
        placeholder={t.images.alt}
        maxLength={200}
        className="h-8 rounded-none border-0 border-t text-xs shadow-none focus-visible:ring-0"
      />
    </div>
  );
}

// ---------- single image (category image, brand logo) ----------

export function SingleImageUpload({
  value,
  onChange,
  className,
  aspect = "aspect-video",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    const err = validate(file);
    if (err) {
      toast.error(err);
      return;
    }
    setBusy(true);
    try {
      const res = await uploadMedia(file);
      onChange(res.url);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const dz = useDropzone((f) => void handle(f[0]));

  return (
    <div className={cn("grid gap-2", className)} {...dz.props}>
      {value ? (
        <div className={cn("group relative overflow-hidden rounded-lg border bg-muted/40", aspect)}>
          <img src={value} alt="" className="size-full object-contain" />
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2Icon className="size-5 animate-spin" />
            </div>
          )}
          <div className="absolute top-1.5 right-1.5 flex gap-1">
            <Button variant="secondary" size="xs" className="bg-background/85 backdrop-blur" onClick={() => inputRef.current?.click()} disabled={busy}>
              <UploadIcon />
              {t.images.replace}
            </Button>
            <Button variant="secondary" size="icon-xs" className="bg-background/85 text-destructive backdrop-blur" onClick={() => onChange(null)} aria-label={t.images.remove}>
              <XIcon />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 text-center transition-colors hover:border-primary/60 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
            aspect,
            dz.over && "border-primary bg-primary/5",
          )}
        >
          {busy ? <Loader2Icon className="size-5 animate-spin text-muted-foreground" /> : <ImagePlusIcon className="size-5 text-muted-foreground" />}
          <span className="text-[13px] font-medium">{busy ? t.images.uploading : t.images.upload}</span>
          <span className="text-xs text-muted-foreground">{t.images.formats}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        hidden
        onChange={(e) => {
          void handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
