import { Section, Container } from "./ui/Grid";
import { SectionHeader } from "./ui/SectionHeader";
import { Card } from "./ui/Card";

export function WhatIsTeer() {
  return (
    <Section background="white" className="!py-20 lg:!py-32">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeader
            title="What is Shillong Teer? - Traditions & Results"
            subtitle="The intersection of ancient archery tradition and modern number prediction in Meghalaya."
            centered={true}
          />
          <Card className="p-8 md:p-12 text-left !rounded-[2.5rem] bg-gray-50/50 border-gray-100/50 shadow-2xl shadow-gray-100/20 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="space-y-6 relative z-10">
              <p className="text-base text-gray-600 font-medium leading-relaxed">
                <strong className="text-gray-900 font-bold">Shillong Teer is a traditional archery-based game</strong> played daily in the
                hills of Meghalaya. Regulated by the state, it combines ancient archery tradition with daily number predictions, making the
                <strong className="text-gray-900 font-bold"> Shillong Teer Result Today</strong> a highly anticipated update for enthusiasts.
              </p>
              <p className="text-base text-gray-600 font-medium leading-relaxed">
                The <strong className="text-gray-900 font-bold">Official Teer Results</strong> are determined twice daily based on the number
                of arrows hitting the target. This unique process ensures that every <strong className="text-gray-900 font-bold">Teer Result</strong>
                is verified and transparent.
              </p>
              <p className="text-base text-gray-600 font-medium leading-relaxed">
                Our platform provides the fastest updates for <strong className="text-gray-900 font-bold">Teer Result Today</strong> across all major
                games, including Shillong, Khanapara, and Juwai, alongside accurate <strong className="text-gray-900 font-bold">Teer Common Numbers</strong>.
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
