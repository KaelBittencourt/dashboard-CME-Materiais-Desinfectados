import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ label, options, selected, onChange, placeholder = "Todos" }: Props) {
  const [open, setOpen] = useState(false);

  const toggle = (v: string) => {
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-[180px]">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between font-normal h-10 bg-card"
          >
            <span className="truncate text-left flex-1">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : selected.length <= 2 ? (
                selected.map((v) => options.find((o) => o.value === v)?.label || v).join(", ")
              ) : (
                `${selected.length} selecionados`
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>Nada encontrado.</CommandEmpty>
              <CommandGroup>
                {selected.length > 0 && (
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="text-destructive font-medium"
                  >
                    <X className="mr-2 h-4 w-4" /> Limpar seleção
                  </CommandItem>
                )}
                {options.map((opt) => {
                  const checked = selected.includes(opt.value);
                  return (
                    <CommandItem key={opt.value} onSelect={() => toggle(opt.value)}>
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          checked
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-muted-foreground/40 opacity-60"
                        )}
                      >
                        {checked && <Check className="h-3 w-3" />}
                      </div>
                      <span>{opt.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {selected.slice(0, 3).map((v) => (
            <Badge key={v} variant="secondary" className="text-xs gap-1">
              {options.find((o) => o.value === v)?.label || v}
              <button onClick={() => toggle(v)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selected.length > 3 && (
            <Badge variant="secondary" className="text-xs">+{selected.length - 3}</Badge>
          )}
        </div>
      )}
    </div>
  );
}
