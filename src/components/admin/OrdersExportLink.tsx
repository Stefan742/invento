/** Shown above the Orders list in the admin. */
export function OrdersExportLink() {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '0 0 1rem' }}>
      <a className="btn btn--style-secondary btn--size-small" href="/api/orders/export.csv" download>
        Download CSV / Преземи CSV
      </a>
      <span style={{ opacity: 0.75, fontSize: 13 }}>
        All orders, for your accountant. / Сите нарачки, за сметководство.
      </span>
    </div>
  )
}
