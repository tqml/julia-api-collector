"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DiffCodeBlock } from "./diff-code-block";
import { DiffLine, gitDiff } from "@/lib/diff";
import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  JuliaModule,
  JuliaModules,
  JuliaVersion,
  JuliaVersions,
} from "@/lib/julia";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { z } from "zod";
import { useSearchParams } from "next/navigation";

interface DiffViewerProps {
  className?: string;
}

const ModuleSchema = z.enum(JuliaModules).optional();
const VersionSchema = z.enum(JuliaVersions).optional();

export function DiffViewer({ className }: DiffViewerProps) {
  const [module, setModule] = useState<JuliaModule>("Base");
  const [versionLeft, setVersionLeft] = useState<JuliaVersion>("1.6");
  const [versionRight, setVersionRight] = useState<JuliaVersion>("1.11");
  const [showUnchanged, setShowUnchanged] = useState(true);
  const [diffDisabled, setDiffDisabled] = useState(false);

  const juliaVersionFetcher = async ([_url, version, module]: [
    string,
    string,
    string,
  ]) => {
    const path = `/julia/api-${version}/${module}.txt`;
    const resp = await fetch(path);
    return await resp.text();
  };

  const { data: leftFile } = useSWR(
    [`api/version`, versionLeft, module],
    juliaVersionFetcher,
  );
  const { data: rightFile } = useSWR(
    [`api/version`, versionRight, module],
    juliaVersionFetcher,
  );

  const diff = useMemo(() => {
    if (!leftFile || !rightFile) {
      return [] as DiffLine[];
    }
    return gitDiff(leftFile, rightFile);
  }, [leftFile, rightFile]);

  return (
    <div className={cn("flex flex-col gap-4 px-4", className)}>
      <div className="flex items-center justify-end gap-8">
        <Select
          value={module}
          onValueChange={(m) => setModule(m as JuliaModule)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select left file" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Version</SelectLabel>
              {JuliaModules.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex align-bottom gap-2">
          <Switch
            id=""
            checked={diffDisabled}
            onCheckedChange={setDiffDisabled}
          />
          <Label>Disable Git Diff</Label>
        </div>
        <div className="flex align-bottom gap-2">
          <Switch
            id=""
            checked={showUnchanged}
            onCheckedChange={setShowUnchanged}
          />
          <Label>Show unchanged Lines</Label>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/50 p-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Select
            value={versionLeft}
            onValueChange={(v) => setVersionLeft(v as JuliaVersion)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select left file" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Version</SelectLabel>
                {JuliaVersions.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="rounded-lg bg-muted p-2 font-mono text-sm">
            {versionLeft}
          </div>
          <DiffCodeBlock
            diff={diff}
            show="deletions"
            showNormal={showUnchanged}
          />
        </div>
        <div className="space-y-1">
          <Select
            value={versionRight}
            onValueChange={(v) => setVersionRight(v as JuliaVersion)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select right file" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Files</SelectLabel>
                {JuliaVersions.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="rounded-lg bg-muted p-2 font-mono text-sm">
            {versionRight}
          </div>
          <DiffCodeBlock
            diff={diff}
            show="additions"
            showNormal={showUnchanged}
          />
        </div>
      </div>
    </div>
  );
}
