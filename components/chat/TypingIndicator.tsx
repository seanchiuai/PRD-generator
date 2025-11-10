export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg px-4 py-2">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-200" />
        </div>
      </div>
    </div>
  );
}
