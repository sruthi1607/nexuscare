import { useState, type ReactNode } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { Breadcrumb } from '../../../components/ui/Breadcrumb';
import { Button } from '../../../components/ui/Button';
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { Checkbox } from '../../../components/ui/Checkbox';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { DialogClose, Modal } from '../../../components/ui/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/Dropdown';
import { Field } from '../../../components/ui/Field';
import { Input, Textarea } from '../../../components/ui/Input';
import { Pagination } from '../../../components/ui/Pagination';
import { RadioGroup } from '../../../components/ui/Radio';
import { Select } from '../../../components/ui/Select';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Spinner } from '../../../components/ui/Spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../../../components/ui/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tabs';
import { useToast } from '../../../components/ui/toast-context';

/** The real design tokens — the table and pagination demo use these instead of invented data. */
const colorTokens = [
  { name: 'brand-50', hex: '#f0fdfa', use: 'Selected and hover backgrounds' },
  { name: 'brand-100', hex: '#ccfbf1', use: 'Subtle brand surfaces' },
  { name: 'brand-600', hex: '#0d9488', use: 'Focus rings, accents' },
  { name: 'brand-700', hex: '#0f766e', use: 'Primary actions, links' },
  { name: 'brand-800', hex: '#115e59', use: 'Primary hover, active nav text' },
  { name: 'brand-900', hex: '#134e4a', use: 'Brand panels' },
  { name: 'info-50', hex: '#eff6ff', use: 'Information backgrounds' },
  { name: 'info-700', hex: '#1d4ed8', use: 'Information text and icons' },
  { name: 'success-50', hex: '#f0fdf4', use: 'Success backgrounds' },
  { name: 'success-700', hex: '#15803d', use: 'Success text and icons' },
  { name: 'warning-50', hex: '#fffbeb', use: 'Warning backgrounds' },
  { name: 'warning-700', hex: '#b45309', use: 'Warning text and icons' },
  { name: 'danger-50', hex: '#fef2f2', use: 'Error backgrounds' },
  { name: 'danger-700', hex: '#b91c1c', use: 'Errors, destructive actions' },
  { name: 'slate-50', hex: '#f8fafc', use: 'App background' },
  { name: 'slate-600', hex: '#475569', use: 'Secondary text' },
  { name: 'slate-900', hex: '#0f172a', use: 'Primary text' },
];
const PAGE_SIZE = 6;

function Showcase({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card id={id} className="scroll-mt-24">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardBody className="space-y-4">{children}</CardBody>
    </Card>
  );
}

function ColorTable() {
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(colorTokens.length / PAGE_SIZE);
  const rows = colorTokens.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <Table caption="Colour tokens">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Swatch</TableHeaderCell>
            <TableHeaderCell>Token</TableHeaderCell>
            <TableHeaderCell>Value</TableHeaderCell>
            <TableHeaderCell>Usage</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((token) => (
            <TableRow key={token.name}>
              <TableCell>
                <span
                  className="block size-6 rounded-md ring-1 ring-slate-900/10"
                  style={{ backgroundColor: token.hex }}
                  aria-hidden="true"
                />
              </TableCell>
              <TableCell className="font-mono text-xs">{token.name}</TableCell>
              <TableCell className="font-mono text-xs">{token.hex}</TableCell>
              <TableCell>{token.use}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}

export function UiKitPage() {
  const { toast } = useToast();
  const [loadingDemo, setLoadingDemo] = useState(false);

  return (
    <>
      <PageHeader
        title="UI kit"
        description="Nexus Care design system components. Content on this page is illustrative."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'UI kit' }]}
      />

      <div className="space-y-6">
        <Showcase id="buttons" title="Buttons" description="Variants, sizes and states.">
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" variant="outline" aria-label="Add">
              <Plus aria-hidden="true" />
            </Button>
            <Button disabled>Disabled</Button>
            <Button
              loading={loadingDemo}
              onClick={() => {
                setLoadingDemo(true);
                window.setTimeout(() => {
                  setLoadingDemo(false);
                }, 1500);
              }}
            >
              {loadingDemo ? 'Saving…' : 'Click to load'}
            </Button>
          </div>
        </Showcase>

        <Showcase
          id="badges"
          title="Badges"
          description="Always text plus colour, never colour alone."
        >
          <div className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="brand">Brand</Badge>
            <Badge tone="info">Information</Badge>
            <Badge tone="success" icon={<CheckCircle2 aria-hidden="true" />}>
              Confirmed
            </Badge>
            <Badge tone="warning">Pending review</Badge>
            <Badge tone="danger">Critical</Badge>
          </div>
        </Showcase>

        <Showcase id="alerts" title="Alerts">
          <Alert tone="info" title="Information">
            Contextual guidance for the current page.
          </Alert>
          <Alert tone="success" title="Saved">
            Your changes were saved.
          </Alert>
          <Alert tone="warning" title="Check before continuing">
            Some details need your attention.
          </Alert>
          <Alert
            tone="danger"
            title="Something went wrong"
            actions={
              <Button size="sm" variant="outline">
                Retry
              </Button>
            }
          >
            The action could not be completed.
          </Alert>
        </Showcase>

        <Showcase
          id="forms"
          title="Form controls"
          description="Labels, hints and errors are linked for screen readers."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Text input" hint="Helper text describes the expected value.">
              {(p) => <Input placeholder="Placeholder" {...p} />}
            </Field>
            <Field label="With icon">
              {(p) => (
                <Input leadingIcon={<Search aria-hidden="true" />} placeholder="Search" {...p} />
              )}
            </Field>
            <Field label="Invalid input" error="This field is required." required>
              {(p) => <Input {...p} />}
            </Field>
            <Field label="Disabled input">
              {(p) => <Input disabled value="Not editable" {...p} />}
            </Field>
            <Field label="Select">
              {(p) => (
                <Select
                  placeholder="Choose an option"
                  options={[
                    { value: 'one', label: 'Option one' },
                    { value: 'two', label: 'Option two' },
                    { value: 'three', label: 'Option three', disabled: true },
                  ]}
                  {...p}
                />
              )}
            </Field>
            <Field label="Textarea">{(p) => <Textarea rows={3} {...p} />}</Field>
            <div className="space-y-3">
              <Checkbox label="Checkbox" description="Optional supporting text." />
              <Checkbox label="Checked by default" defaultChecked />
              <Checkbox label="With error" error="Please confirm to continue." />
            </div>
            <RadioGroup
              legend="Radio group"
              name="uikit-radio"
              options={[
                { value: 'a', label: 'First option', description: 'Supporting text' },
                { value: 'b', label: 'Second option' },
                { value: 'c', label: 'Unavailable option', disabled: true },
              ]}
            />
          </div>
          <RadioGroup
            legend="Radio cards"
            name="uikit-radio-cards"
            variant="cards"
            options={[
              { value: 'video', label: 'Video', description: 'Camera and audio' },
              { value: 'audio', label: 'Audio only', description: 'For weak connections' },
              { value: 'in_person', label: 'In person', description: 'At the clinic' },
            ]}
          />
        </Showcase>

        <Showcase id="overlays" title="Dialogs, menus and toasts">
          <div className="flex flex-wrap gap-3">
            <Modal
              trigger={<Button variant="outline">Open modal</Button>}
              title="Modal dialog"
              description="Focus is trapped inside; press Escape or Close to dismiss."
              footer={
                <DialogClose asChild>
                  <Button>Done</Button>
                </DialogClose>
              }
            >
              <p className="text-slate-600">
                Modals hold short, focused tasks. Longer flows should use a full page.
              </p>
            </Modal>

            <ConfirmDialog
              trigger={
                <Button variant="danger">
                  <Trash2 aria-hidden="true" />
                  Delete item
                </Button>
              }
              tone="danger"
              title="Delete this item?"
              description="This demo waits one second to show the pending state. Nothing is deleted."
              confirmLabel="Delete"
              onConfirm={() =>
                new Promise<void>((resolve) => {
                  window.setTimeout(() => {
                    toast({ title: 'Demo complete', description: 'Nothing was deleted.' });
                    resolve();
                  }, 1000);
                })
              }
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions
                  <MoreHorizontal aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Example actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Pencil aria-hidden="true" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy aria-hidden="true" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Download aria-hidden="true" />
                  Download (disabled)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem tone="danger">
                  <Trash2 aria-hidden="true" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-3">
            {(['info', 'success', 'warning', 'danger'] as const).map((tone) => (
              <Button
                key={tone}
                variant="ghost"
                size="sm"
                onClick={() => {
                  toast({
                    tone,
                    title: `${tone[0]?.toUpperCase() ?? ''}${tone.slice(1)} toast`,
                    description: 'Toasts dismiss automatically and pause while hovered.',
                  });
                }}
              >
                Show {tone} toast
              </Button>
            ))}
          </div>
        </Showcase>

        <Showcase id="navigation" title="Tabs and breadcrumb">
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/dashboard' },
              { label: 'Section', to: '/ui-kit' },
              { label: 'Current page' },
            ]}
          />
          <Tabs defaultValue="overview">
            <TabsList aria-label="Example tabs">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="text-sm text-slate-600">
              Use the arrow keys to move between tabs.
            </TabsContent>
            <TabsContent value="details" className="text-sm text-slate-600">
              Tab panels are linked to their tabs for screen readers.
            </TabsContent>
            <TabsContent value="history" className="text-sm text-slate-600">
              Only the active panel is rendered.
            </TabsContent>
          </Tabs>
        </Showcase>

        <Showcase
          id="table"
          title="Table and pagination"
          description="Scrolls horizontally on small screens."
        >
          <ColorTable />
        </Showcase>

        <Showcase id="states" title="Loading, empty and error states">
          <div className="grid gap-4 lg:grid-cols-3">
            <div
              className="space-y-3 rounded-xl border border-slate-200 p-4"
              aria-label="Loading example"
            >
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Spinner label="Loading example" />
            </div>
            <EmptyState
              title="Nothing here yet"
              description="Empty states explain what will appear and how to start."
              action={<Button size="sm">Primary action</Button>}
            />
            <ErrorState
              title="Could not load"
              message="Error states explain what happened and offer a retry."
              onRetry={() => {
                toast({ title: 'Retry pressed' });
              }}
            />
          </div>
        </Showcase>
      </div>
    </>
  );
}
