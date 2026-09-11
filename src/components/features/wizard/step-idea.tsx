"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWizardStore } from "@/store/wizard";
import { PROJECT_SCALES, type ProjectScale } from "@/types/project";

const ideaSchema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  abstractIdea: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(2000, "Maksimal 2000 karakter"),
});

type IdeaForm = z.infer<typeof ideaSchema>;

const SCALE_LABELS: Record<ProjectScale, { label: string; desc: string }> = {
  weekend: {
    label: "Weekend Sprint",
    desc: "1-3 hari, MVP cepat",
  },
  startup: {
    label: "Startup Ready",
    desc: "Produksi, skalabel",
  },
};

export function StepIdea() {
  const {
    title,
    abstractIdea,
    scale,
    setTitle,
    setAbstractIdea,
    setScale,
    nextStep,
  } = useWizardStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IdeaForm>({
    resolver: zodResolver(ideaSchema),
    defaultValues: { title, abstractIdea },
  });

  const onSubmit = (data: IdeaForm) => {
    setTitle(data.title);
    setAbstractIdea(data.abstractIdea);
    nextStep();
  };

  const canProceed = scale !== "" && !errors.title && !errors.abstractIdea;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Ide Proyek</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Proyek</Label>
            <Input
              id="title"
              placeholder="Contoh: E-learning Platform"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abstractIdea">Deskripsi Ide</Label>
            <Textarea
              id="abstractIdea"
              placeholder="Jelaskan ide proyek Anda secara bebas. Semakin detail, semakin baik hasil yang dihasilkan AI."
              rows={5}
              {...register("abstractIdea")}
            />
            {errors.abstractIdea && (
              <p className="text-sm text-destructive">
                {errors.abstractIdea.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Skala Proyek</Label>
            <div className="grid grid-cols-2 gap-3">
              {(PROJECT_SCALES as readonly ProjectScale[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScale(s)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    scale === s
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <span className="block text-sm font-medium">
                    {SCALE_LABELS[s].label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {SCALE_LABELS[s].desc}
                  </span>
                </button>
              ))}
            </div>
            {!scale && (
              <p className="text-xs text-muted-foreground">
                Pilih skala proyek
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={!canProceed || !scale}>
              Lanjut →
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
