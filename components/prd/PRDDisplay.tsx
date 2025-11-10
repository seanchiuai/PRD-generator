"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PRDDisplayProps {
  prd: any;
}

export function PRDDisplay({ prd }: PRDDisplayProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="techstack">Tech Stack</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="architecture">Architecture</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{prd.projectOverview.productName}</CardTitle>
            <CardDescription>{prd.projectOverview.tagline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {prd.projectOverview.description}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Target Audience</h4>
              <p className="text-sm text-muted-foreground">
                {prd.projectOverview.targetAudience}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Problem Statement</h4>
              <p className="text-sm text-muted-foreground">
                {prd.projectOverview.problemStatement}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purpose & Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Vision</h4>
              <p className="text-sm text-muted-foreground">{prd.purposeAndGoals.vision}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Objectives</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {prd.purposeAndGoals.keyObjectives.map((obj: string, i: number) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="techstack" className="space-y-4">
        {Object.entries(prd.techStack).map(([key, value]: [string, any]) => {
          if (key === "reasoning" || key === "additionalTools") return null;
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="capitalize">{key}</CardTitle>
                <CardDescription>{value.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{value.purpose}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400">
                      Pros
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {value.pros.map((pro: string, i: number) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2 text-red-700 dark:text-red-400">
                      Cons
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {value.cons.map((con: string, i: number) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </TabsContent>

      <TabsContent value="features" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>MVP Features</CardTitle>
            <CardDescription>Critical features for initial launch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {prd.features.mvpFeatures.map((feature: any, i: number) => (
              <div key={i} className="border-l-4 border-primary pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{feature.name}</h4>
                  <Badge>{feature.priority}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {feature.description}
                </p>
                <p className="text-sm italic mb-2">
                  <strong>User Story:</strong> {feature.userStory}
                </p>
                <div>
                  <strong className="text-sm">Acceptance Criteria:</strong>
                  <ul className="list-disc list-inside text-sm mt-1">
                    {feature.acceptanceCriteria.map((criteria: string, j: number) => (
                      <li key={j}>{criteria}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="architecture" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>System Design</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {prd.technicalArchitecture.systemDesign}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Models</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prd.technicalArchitecture.dataModels.map((model: any, i: number) => (
              <div key={i} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{model.entityName}</h4>
                <p className="text-sm text-muted-foreground mb-3">{model.description}</p>
                <div className="text-sm font-mono">
                  {model.fields.map((field: any, j: number) => (
                    <div key={j} className="flex justify-between py-1">
                      <span>{field.name}</span>
                      <span className="text-muted-foreground">
                        {field.type} {field.required && "*"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timeline" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Development Timeline</CardTitle>
            <CardDescription>
              Estimated duration: {prd.timeline.estimatedDuration}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prd.timeline.phases.map((phase: any, i: number) => (
                <div key={i} className="border-l-4 border-primary pl-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{phase.name}</h4>
                    <Badge variant="outline">{phase.duration}</Badge>
                  </div>
                  <ul className="list-disc list-inside text-sm">
                    {phase.deliverables.map((deliverable: string, j: number) => (
                      <li key={j}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risks & Mitigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prd.risks.map((risk: any, i: number) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <Badge variant="destructive">{risk.category}</Badge>
                  <h4 className="font-semibold flex-1">{risk.description}</h4>
                </div>
                <p className="text-sm mb-2">
                  <strong>Impact:</strong> {risk.impact}
                </p>
                <p className="text-sm">
                  <strong>Mitigation:</strong> {risk.mitigation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
