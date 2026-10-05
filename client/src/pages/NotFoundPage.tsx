import { Link, useLocation } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
export default function NotFoundPage() {
  const location = useLocation()

  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Page not found</EmptyTitle>
        <EmptyDescription>
          Nothing lives at <code>{location.pathname}</code>.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to="/">Back to search</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
