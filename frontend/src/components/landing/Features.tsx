export function Features() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-8">Features</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Easy to Use</h3>
          <p className="text-muted-foreground">Simple and intuitive interface</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Secure</h3>
          <p className="text-muted-foreground">Your data is safe with us</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Fast</h3>
          <p className="text-muted-foreground">Quick and responsive</p>
        </div>
      </div>
    </section>
  )
}
