import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Circle,
  ExternalLink,
  Send,
  Trophy,
  Star,
  X,
  Flag,
  Lock,
} from "lucide-react";
import { api } from "../lib/api";
import type { Flag as FlagType, SubmitFlagResponse } from "../types/api";

function FlagModal({
  flag,
  onClose,
}: {
  flag: FlagType;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const submitMutation = useMutation<SubmitFlagResponse, Error, string>({
    mutationFn: (f) => api.post<SubmitFlagResponse>("/flags/submit", { flagId: flag.id, flag: f }),
    onSuccess: (data) => {
      setFeedback({ type: "success", message: data.message });
      setInput("");
      queryClient.invalidateQueries({ queryKey: ["flags"] });
      queryClient.invalidateQueries({ queryKey: ["ranking"] });
    },
    onError: (err) => {
      setFeedback({ type: "error", message: err.message });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setFeedback(null);
    submitMutation.mutate(input.trim());
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="flag-icon">
              {flag.validated ? (
                <CheckCircle size={20} className="icon-success" />
              ) : (
                <Circle size={20} className="icon-muted" />
              )}
            </div>
            <h2 className="modal-title">{flag.name}</h2>
            <span className="flag-points">
              <Star size={13} />
              {flag.points} pts
            </span>
          </div>
          <button className="btn-icon modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">{flag.description}</p>

          <a
            href={flag.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="modal-repo-link"
          >
            <ExternalLink size={14} />
            Voir le repository
          </a>

          {flag.validated ? (
            <div className="modal-validated">
              <CheckCircle size={16} />
              Validé
              {flag.validatedAt && (
                <span className="modal-validated-date">
                  le {new Date(flag.validatedAt).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
          ) : (
            <form className="modal-submit-form" onSubmit={handleSubmit}>
              <div className="modal-input-row">
                <Lock size={15} className="input-icon" />
                <input
                  type="text"
                  className="flag-input"
                  placeholder="Entrer le flag…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={submitMutation.isPending}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitMutation.isPending || !input.trim()}
                >
                  <Send size={14} />
                  Valider
                </button>
              </div>
              {feedback && (
                <div className={`feedback feedback-${feedback.type}`}>
                  {feedback.type === "success" ? (
                    <CheckCircle size={14} />
                  ) : (
                    <Circle size={14} />
                  )}
                  {feedback.message}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FlagsPage() {
  const [selected, setSelected] = useState<FlagType | null>(null);

  const { data: flags = [], isLoading } = useQuery<FlagType[]>({
    queryKey: ["flags"],
    queryFn: () => api.get<FlagType[]>("/flags"),
  });

  const validated = flags.filter((f) => f.validated).length;
  const total = flags.length;
  const totalPoints = flags
    .filter((f) => f.validated)
    .reduce((acc, f) => acc + f.points, 0);

  const updatedSelected =
    selected ? (flags.find((f) => f.id === selected.id) ?? selected) : null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Flags</h1>
        <div className="stats-row">
          <span className="stat-badge">
            <Trophy size={14} />
            {totalPoints} pts
          </span>
          <span className="stat-badge">
            <CheckCircle size={14} />
            {validated}/{total} validés
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-grid">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flag-card skeleton" />
          ))}
        </div>
      ) : (
        <div className="flags-grid">
          {flags.map((flag) => (
            <button
              key={flag.id}
              className={`flag-card flag-card--btn ${flag.validated ? "flag-card--validated" : ""}`}
              onClick={() => setSelected(flag)}
            >
              <div className="flag-card-header">
                <div className="flag-icon">
                  {flag.validated ? (
                    <CheckCircle size={18} className="icon-success" />
                  ) : (
                    <Flag size={18} className="icon-muted" />
                  )}
                </div>
                <span className="flag-points">
                  <Star size={12} />
                  {flag.points} pts
                </span>
              </div>
              <h3 className="flag-name">{flag.name}</h3>
              <p className="flag-description">{flag.description}</p>
              <div className="flag-card-footer">
                {flag.validated && flag.validatedAt ? (
                  <span className="flag-date">
                    {new Date(flag.validatedAt).toLocaleDateString("fr-FR")}
                  </span>
                ) : (
                  <span className="flag-status-hint">
                    <Lock size={11} />
                    Non validé
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {updatedSelected && (
        <FlagModal flag={updatedSelected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
