type Props = {
  success?: string;
  error?: string;
};

export function Alert({ success, error }: Props) {
  if (!success && !error) return null;

  return (
    <>
      {success ? <div className="alert alert-success">{success}</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
    </>
  );
}
