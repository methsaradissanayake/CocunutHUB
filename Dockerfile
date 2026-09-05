# ==========================================
# Stage 1: Build Frontend (React + Vite)
# ==========================================
FROM node:20-alpine AS client-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Build Backend (.NET 10)
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api-build
WORKDIR /src

COPY ["backend/src/CoconutHub.Core/CoconutHub.Core.csproj", "backend/src/CoconutHub.Core/"]
COPY ["backend/src/CoconutHub.Infrastructure/CoconutHub.Infrastructure.csproj", "backend/src/CoconutHub.Infrastructure/"]
COPY ["backend/src/CoconutHub.Api/CoconutHub.Api.csproj", "backend/src/CoconutHub.Api/"]
RUN dotnet restore "backend/src/CoconutHub.Api/CoconutHub.Api.csproj"

COPY backend/ ./backend/
WORKDIR "/src/backend/src/CoconutHub.Api"
RUN dotnet publish "CoconutHub.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ==========================================
# Stage 3: Unified Production Runtime
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Copy published API
COPY --from=api-build /app/publish .

# Copy Vite SPA assets into wwwroot for unified all-in-one serving
COPY --from=client-build /app/frontend/dist ./wwwroot

# Ensure directory is writable for SQLite database in Hugging Face / container environments
RUN chmod -R 777 /app

# Port 7860 is the standard port for Hugging Face Spaces & cloud containers
ENV ASPNETCORE_URLS=http://+:7860
ENV PORT=7860
EXPOSE 7860

ENTRYPOINT ["dotnet", "CoconutHub.Api.dll"]
