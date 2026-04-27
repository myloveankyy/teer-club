import { Section, Container, Grid } from "./ui/Grid";
import { SectionHeader } from "./ui/SectionHeader";
import { Card } from "./ui/Card";

export function AboutTeer() {
  return (
    <Section background="white" className="!py-20 lg:!py-32">
      <Container>
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            title="Teer Result Verification"
            subtitle="Our verification system ensures every result on Teer.club is 100% accurate and official."
            centered={false}
          />
          <div className="space-y-8">
            <Card className="p-8 !rounded-3xl bg-gray-50/30 border-gray-100 italic">
              <p className="text-base text-gray-600 font-medium leading-relaxed">
                <strong className="text-gray-900 font-bold underline decoration-blue-200">Teer is a legal archery-based lottery</strong> operated under government
                regulation in select states of North-East India. Results are determined by counting arrows that hit the target.
              </p>
            </Card>

            <p className="text-base text-gray-600 font-medium leading-relaxed pl-4 border-l-4 border-blue-500">
              The last two digits of the total arrow count become the winning numbers. For example, if 1,234 arrows hit
              the target, the winning number would be <strong className="text-gray-900 font-bold">34</strong>.
            </p>
          </div>

          <div className="mt-16">
            <h3 className="mb-8 text-xl font-bold text-gray-900 tracking-tight">
              Official Teer Games
            </h3>
            <Grid cols={2}>
              <Card className="p-6 md:p-8 !rounded-3xl border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all duration-300">
                <p className="font-bold text-blue-600 text-xs uppercase tracking-widest mb-2">Meghalaya</p>
                <p className="text-base font-semibold text-gray-700">Shillong Teer, Laitlyngkot Teer</p>
              </Card>
              <Card className="p-6 md:p-8 !rounded-3xl border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all duration-300">
                <p className="font-bold text-blue-600 text-xs uppercase tracking-widest mb-2">Assam</p>
                <p className="text-base font-semibold text-gray-700">Khanapara Teer, Juwai Teer</p>
              </Card>
              <Card className="p-6 md:p-8 !rounded-3xl border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all duration-300">
                <p className="font-bold text-blue-600 text-xs uppercase tracking-widest mb-2">Arunachal Pradesh</p>
                <p className="text-base font-semibold text-gray-700">Local Teer games</p>
              </Card>
              <Card className="p-6 md:p-8 !rounded-3xl border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all duration-300">
                <p className="font-bold text-blue-600 text-xs uppercase tracking-widest mb-2">Bhutan Border</p>
                <p className="text-base font-semibold text-gray-700">Cross-region games</p>
              </Card>
            </Grid>
          </div>
        </div>
      </Container>
    </Section>
  );
}
