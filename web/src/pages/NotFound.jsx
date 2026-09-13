import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="animate-fade-in py-24 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <FileQuestion size={26} />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Page not found</h1>
      <p className="mx-auto mt-3 max-w-md text-slate-500">
        That link doesn&rsquo;t point anywhere. It may have been deleted, or the share link expired.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/" className="btn-primary">Back home</Link>
        <Link to="/library" className="btn-secondary">Browse library</Link>
      </div>
    </div>
  );
}
