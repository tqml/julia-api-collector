export function SiteFooter() {
    return (
        <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Generated {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}. This is an example
                    implementation - no correctness guarantees.
                </p>
            </div>
        </footer>
    )
}

