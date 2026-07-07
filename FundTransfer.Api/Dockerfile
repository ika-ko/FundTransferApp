FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore first so the package cache layer survives source-only changes
COPY FundTransfer.Api.csproj ./
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# The aspnet:8.0 base image listens on 8080 by default (ASPNETCORE_HTTP_PORTS)
EXPOSE 8080
ENTRYPOINT ["dotnet", "FundTransfer.Api.dll"]
