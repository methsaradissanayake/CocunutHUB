FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["src/CoconutHub.Core/CoconutHub.Core.csproj", "src/CoconutHub.Core/"]
COPY ["src/CoconutHub.Infrastructure/CoconutHub.Infrastructure.csproj", "src/CoconutHub.Infrastructure/"]
COPY ["src/CoconutHub.Api/CoconutHub.Api.csproj", "src/CoconutHub.Api/"]

RUN dotnet restore "src/CoconutHub.Api/CoconutHub.Api.csproj"

COPY . .
WORKDIR "/src/src/CoconutHub.Api"
RUN dotnet publish "CoconutHub.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "CoconutHub.Api.dll"]
