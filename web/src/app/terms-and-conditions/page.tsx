const clauses = [
  {
    title: "Service Scope",
    body: "Describeflow is a subscription-based SaaS platform that generates product descriptions using AI. Access and feature limits are determined by your selected plan.",
  },
  {
    title: "Account Responsibility",
    body: "You are responsible for account credentials, authorized usage, and any activity performed through your account. You must provide accurate registration and billing information.",
  },
  {
    title: "Subscription and Billing",
    body: "Paid plans renew according to your billing period. Failure, cancellation, or expiry of subscription payment may reduce access to paid features and limits.",
  },
  {
    title: "Acceptable Use",
    body: "You agree not to submit illegal, infringing, harmful, or deceptive content. You retain responsibility for reviewing and validating AI-generated outputs before publication.",
  },
  {
    title: "Intellectual Property",
    body: "Platform design, software, and brand assets remain property of Describeflow. You may use generated content under applicable laws and your subscription terms.",
  },
  {
    title: "Liability Limitation",
    body: "The service is provided on an as-is basis. To the maximum extent permitted by law, Describeflow is not liable for indirect, incidental, or consequential damages from use of the platform.",
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
      <section className="glass rounded-3xl p-7 shadow-card sm:p-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Terms & Conditions</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted sm:text-base">
          These Terms govern use of Describeflow and apply to all users of the AI product
          description platform, including free and paid subscriptions.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        {clauses.map((clause) => (
          <article key={clause.title} className="glass rounded-2xl p-6 shadow-card">
            <h2 className="text-lg font-semibold">{clause.title}</h2>
            <p className="mt-2 text-sm text-muted">{clause.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

