"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  RiSunLine,
  RiMoonLine,
  RiDeleteBinLine,
  RiEditLine,
  RiShareLine,
  RiMore2Line,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
  RiInformationLine,
  RiStarLine,
  RiHeartLine,
  RiFlashlightLine,
  RiShieldLine,
} from "@remixicon/react"

// Color palette data
const colorTokens = [
  { name: "background", var: "--background" },
  { name: "foreground", var: "--foreground" },
  { name: "primary", var: "--primary" },
  { name: "primary-foreground", var: "--primary-foreground" },
  { name: "secondary", var: "--secondary" },
  { name: "secondary-foreground", var: "--secondary-foreground" },
  { name: "muted", var: "--muted" },
  { name: "muted-foreground", var: "--muted-foreground" },
  { name: "accent", var: "--accent" },
  { name: "accent-foreground", var: "--accent-foreground" },
  { name: "destructive", var: "--destructive" },
  { name: "border", var: "--border" },
  { name: "input", var: "--input" },
  { name: "ring", var: "--ring" },
  { name: "card", var: "--card" },
  { name: "card-foreground", var: "--card-foreground" },
  { name: "popover", var: "--popover" },
  { name: "popover-foreground", var: "--popover-foreground" },
]

const chartColors = [
  { name: "chart-1", var: "--chart-1" },
  { name: "chart-2", var: "--chart-2" },
  { name: "chart-3", var: "--chart-3" },
  { name: "chart-4", var: "--chart-4" },
  { name: "chart-5", var: "--chart-5" },
]

const buttonVariants = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const
const buttonSizes = ["xs", "sm", "default", "lg"] as const
const badgeVariants = ["default", "secondary", "outline", "destructive"] as const

const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"] as const

export default function DesignSystemPage() {
  const [isDark, setIsDark] = React.useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  )
  const [dropdownCheck1, setDropdownCheck1] = React.useState(true)
  const [dropdownCheck2, setDropdownCheck2] = React.useState(false)
  const [dropdownRadio, setDropdownRadio] = React.useState("option1")

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark")
    setIsDark(!isDark)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Nintcha Design System</h1>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <RiSunLine /> : <RiMoonLine />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* Typography */}
        <Section title="Typography" description="Text styles and font hierarchy">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">Heading 1 - The quick brown fox</h1>
              <h2 className="text-3xl font-semibold">Heading 2 - The quick brown fox</h2>
              <h3 className="text-2xl font-semibold">Heading 3 - The quick brown fox</h3>
              <h4 className="text-xl font-medium">Heading 4 - The quick brown fox</h4>
              <h5 className="text-lg font-medium">Heading 5 - The quick brown fox</h5>
              <h6 className="text-base font-medium">Heading 6 - The quick brown fox</h6>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-base">Body text (base) - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <p className="text-sm text-muted-foreground">Small text (muted) - Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
              <p className="text-xs text-muted-foreground">Extra small text - Duis aute irure dolor in reprehenderit.</p>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-4">
              <span className="font-normal">Normal</span>
              <span className="font-medium">Medium</span>
              <span className="font-semibold">Semibold</span>
              <span className="font-bold">Bold</span>
              <span className="italic">Italic</span>
              <span className="underline">Underline</span>
              <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">Monospace</code>
            </div>
          </div>
        </Section>

        {/* Colors */}
        <Section title="Colors" description="Design tokens and color palette">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Base Colors</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {colorTokens.map((color) => (
                  <ColorSwatch key={color.name} name={color.name} cssVar={color.var} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Chart Colors</h3>
              <div className="flex flex-wrap gap-3">
                {chartColors.map((color) => (
                  <ColorSwatch key={color.name} name={color.name} cssVar={color.var} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Buttons" description="Interactive button components with multiple variants and sizes">
          <div className="space-y-8">
            {/* Variants */}
            <div>
              <h3 className="text-lg font-medium mb-4">Variants</h3>
              <div className="flex flex-wrap items-center gap-3">
                {buttonVariants.map((variant) => (
                  <Button key={variant} variant={variant}>
                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-medium mb-4">Sizes</h3>
              <div className="flex flex-wrap items-end gap-3">
                {buttonSizes.map((size) => (
                  <Button key={size} size={size}>
                    Size {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* With Icons */}
            <div>
              <h3 className="text-lg font-medium mb-4">With Icons</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button>
                  <RiCheckLine data-icon="inline-start" />
                  Confirm
                </Button>
                <Button variant="outline">
                  <RiEditLine data-icon="inline-start" />
                  Edit
                </Button>
                <Button variant="destructive">
                  <RiDeleteBinLine data-icon="inline-start" />
                  Delete
                </Button>
                <Button variant="secondary">
                  Share
                  <RiShareLine data-icon="inline-end" />
                </Button>
              </div>
            </div>

            {/* Icon Only */}
            <div>
              <h3 className="text-lg font-medium mb-4">Icon Only</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="icon-xs" variant="ghost"><RiStarLine /></Button>
                <Button size="icon-sm" variant="outline"><RiHeartLine /></Button>
                <Button size="icon"><RiFlashlightLine /></Button>
                <Button size="icon-lg" variant="secondary"><RiShieldLine /></Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-lg font-medium mb-4">States</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges" description="Status indicators and labels">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {badgeVariants.map((variant) => (
                <Badge key={variant} variant={variant}>
                  {variant.charAt(0).toUpperCase() + variant.slice(1)}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge><RiCheckLine className="size-3 mr-1" /> Success</Badge>
              <Badge variant="secondary"><RiInformationLine className="size-3 mr-1" /> Info</Badge>
              <Badge variant="outline"><RiAlertLine className="size-3 mr-1" /> Warning</Badge>
              <Badge variant="destructive"><RiCloseLine className="size-3 mr-1" /> Error</Badge>
            </div>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards" description="Content containers with flexible layouts">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Simple Card */}
            <Card>
              <CardHeader>
                <CardTitle>Simple Card</CardTitle>
                <CardDescription>A basic card with header and content.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is the card content area where you can place any information.
                </p>
              </CardContent>
            </Card>

            {/* Card with Footer */}
            <Card>
              <CardHeader>
                <CardTitle>Card with Footer</CardTitle>
                <CardDescription>Includes action buttons in the footer.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cards can have footers with actions or additional information.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Save</Button>
                <Button size="sm" variant="outline">Cancel</Button>
              </CardFooter>
            </Card>

            {/* Card with Action */}
            <Card>
              <CardHeader>
                <CardTitle>Card with Menu</CardTitle>
                <CardDescription>Has a dropdown menu in the header.</CardDescription>
                <CardAction>
                  <Button variant="ghost" size="icon-sm">
                    <RiMore2Line />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The card action slot allows for contextual menus or quick actions.
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Alert Dialogs */}
        <Section title="Alert Dialogs" description="Modal confirmations and alerts">
          <div className="flex flex-wrap gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>Open Dialog</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Dialog with Icon</Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <RiAlertLine className="text-destructive" />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This item will be permanently removed from your inventory.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Section>

        {/* Dropdown Menus */}
        <Section title="Dropdown Menus" description="Contextual menus with various item types">
          <div className="flex flex-wrap gap-4">
            {/* Simple Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Simple Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem><RiEditLine /> Edit</DropdownMenuItem>
                <DropdownMenuItem><RiShareLine /> Share</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive"><RiDeleteBinLine /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Checkbox Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Checkbox Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>View Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={dropdownCheck1}
                  onCheckedChange={setDropdownCheck1}
                >
                  Show Sidebar
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={dropdownCheck2}
                  onCheckedChange={setDropdownCheck2}
                >
                  Show Status Bar
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Radio Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Radio Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={dropdownRadio} onValueChange={setDropdownRadio}>
                  <DropdownMenuRadioItem value="option1"><RiSunLine /> Light</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="option2"><RiMoonLine /> Dark</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="option3">System</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Section>

        {/* Form Controls */}
        <Section title="Form Controls" description="Input fields and selection components">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Text Inputs */}
            <Card>
              <CardHeader>
                <CardTitle>Text Inputs</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="input-default">Default Input</FieldLabel>
                    <Input id="input-default" placeholder="Enter text..." />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="input-disabled">Disabled Input</FieldLabel>
                    <Input id="input-disabled" placeholder="Disabled" disabled />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="textarea-default">Textarea</FieldLabel>
                    <Textarea id="textarea-default" placeholder="Enter longer text..." />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Selection Components */}
            <Card>
              <CardHeader>
                <CardTitle>Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="select-default">Select</FieldLabel>
                    <Select>
                      <SelectTrigger id="select-default">
                        <SelectValue placeholder="Choose an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="fire">🔥 Fire</SelectItem>
                          <SelectItem value="water">💧 Water</SelectItem>
                          <SelectItem value="wind">💨 Wind</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="combobox-default">Combobox</FieldLabel>
                    <Combobox items={frameworks}>
                      <ComboboxInput id="combobox-default" placeholder="Search frameworks..." />
                      <ComboboxContent>
                        <ComboboxEmpty>No results found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Separators */}
        <Section title="Separators" description="Visual dividers between content">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Content above the separator</p>
            <Separator />
            <p className="text-sm text-muted-foreground">Content below the separator</p>
          </div>
        </Section>
      </main>
    </div>
  )
}

// Helper Components
function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function ColorSwatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-12 w-full rounded border border-border"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <span className="text-xs font-mono truncate">{name}</span>
    </div>
  )
}
