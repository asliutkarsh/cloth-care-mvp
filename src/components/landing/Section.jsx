const Section = ({ children, className = '' }) => (
  <section className={`container px-4 sm:px-6 lg:px-8 py-14 md:py-20 ${className}`}>{children}</section>
);

export default Section;