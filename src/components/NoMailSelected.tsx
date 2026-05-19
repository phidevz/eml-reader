export function NoMailSelected() {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center">
        <p className="text-lg font-medium mb-2">Select an Email</p>
        <p className="text-sm">Choose an email from the sidebar to view</p>
      </div>
    </div>
  );
}
