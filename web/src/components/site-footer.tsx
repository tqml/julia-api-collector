export function SiteFooter() {
  const date = new Date("2025-02-22");

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row px-8">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Generated {date.toLocaleDateString()}.
        </p>
      </div>
    </footer>
  );
}
